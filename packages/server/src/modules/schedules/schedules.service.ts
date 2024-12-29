import { ScheduleRecurring } from '@/entities/recurring-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import OpenAI from 'openai'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { GroupService } from '../group/group.service'
import { VoiceTranscriptionService } from './voice-transcription.service'
import { UsersService } from '../users/users.service'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { WeekQueryDto } from './dto/week-query-schedule.dto'
import { CreateScheduleDto, RecurringInfo } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { Category } from '@/entities/category.entity'
import { Transactional } from 'typeorm-transactional'
import { RecurringSchedulesService } from './recurring-schedules.service'
import { ScheduleUtils } from './schedules.util'

@Injectable()
export class SchedulesService {
  private openai: OpenAI
  private readonly logger = new Logger(SchedulesService.name)

  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ScheduleRecurring)
    private recurringRepository: Repository<ScheduleRecurring>,
    private readonly configService: ConfigService,
    private readonly voiceTranscriptionService: VoiceTranscriptionService,
    private readonly usersService: UsersService,
    @InjectRepository(GroupSchedule)
    private groupScheduleRepository: Repository<GroupSchedule>,
    private groupService: GroupService,
    private readonly recurringSchedulesService: RecurringSchedulesService,
    private readonly scheduleUtils: ScheduleUtils,
  ) {}

  // 일정 조회 관련 메서드

  /**
   * 사용자의 모든 일정을 조회합니다.
   */
  async findAllByUserUuid(userUuid: string): Promise<ResponseScheduleDto[]> {
    const startDate = new Date(Date.UTC(2000, 0, 1))
    const endDate = new Date(Date.UTC(2100, 11, 31, 23, 59, 59, 999))
    return this.getSchedulesInRange(userUuid, startDate, endDate)
  }

  async findByMonth(
    userUuid: string,
    year: number,
    month: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const dateRange = this.scheduleUtils.calculateMonthlyRange(year, month)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  async findByWeek(
    userUuid: string,
    date: string,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const inputDate = new Date(date)
    const dateRange = this.scheduleUtils.calculateWeeklyRange(inputDate)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  async findByDate(dateQuery: WeekQueryDto): Promise<ResponseScheduleDto[]> {
    await this.validateUser(dateQuery.userUuid)
    const dateRange = this.scheduleUtils.calculateDailyRange(dateQuery.date)
    return this.getSchedulesInRange(
      dateQuery.userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  async findByYear(
    userUuid: string,
    year: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const dateRange = this.scheduleUtils.calculateYearlyRange(year)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  /**
   * 특정 기간 내의 일정을 조회합니다.
   */
  async getSchedulesInRange(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ResponseScheduleDto[]> {
    const [regularSchedules, recurringSchedules] = await Promise.all([
      this.findRegularSchedulesInRange(userUuid, startDate, endDate),
      this.findRecurringSchedules(userUuid),
    ])

    const expandedRecurringSchedules = this.expandRecurringSchedules(
      recurringSchedules,
      startDate,
      endDate,
    )

    const sharedGroupSchedules = await this.findSharedGroupSchedules(
      userUuid,
      startDate,
      endDate,
    )

    const allSchedules = [
      ...regularSchedules,
      ...expandedRecurringSchedules,
      ...sharedGroupSchedules,
    ]
    allSchedules.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    const convertedSchedules = await Promise.all(
      allSchedules.map((schedule) =>
        this.scheduleUtils.convertToResponseDto(schedule),
      ),
    )

    return convertedSchedules
  }

  /**
   * 특정 일정을 ID로 조회합니다.
   */
  async findOne(id: number): Promise<ResponseScheduleDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { scheduleId: id },
      relations: ['category', 'recurring'],
    })
    if (!schedule) {
      throw new NotFoundException(
        `해당 id : ${id}를 가진 일정을 찾을 수 없습니다.`,
      )
    }
    return this.scheduleUtils.convertToResponseDto(schedule)
  }

  // 공유된 일정을 파악하는 함수.
  private async findSharedGroupSchedules(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Schedule[]> {
    return this.schedulesRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.groupSchedules', 'groupSchedule')
      .where('groupSchedule.userUuid = :userUuid', { userUuid })
      .andWhere('schedule.startDate <= :endDate', { endDate })
      .andWhere('schedule.endDate >= :startDate', { startDate })
      .getMany()
  }

  private async findSharedGroupSchedulesByScheduleId(
    userUuid: string,
    scheduleId: number,
  ): Promise<Schedule> {
    return this.schedulesRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.groupSchedules', 'groupSchedule')
      .where('groupSchedule.userUuid = :userUuid', { userUuid })
      .andWhere('schedule.scheduleId = :scheduleId', { scheduleId })
      .getOne()
  }

  /**
   * 새로운 일정을 생성합니다.
   */
  @Transactional()
  async createSchedule(
    userUuid: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId: createScheduleDto.categoryId ?? 7 },
    })

    if (!category) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.')
    }

    const startDate = new Date(createScheduleDto.startDate)
    const endDate = new Date(createScheduleDto.endDate)

    if (endDate <= startDate) {
      throw new BadRequestException('종료일은 시작일보다 이후여야 합니다.')
    }

    if (createScheduleDto.recurringOptions) {
      const repeatEndDate = new Date(
        createScheduleDto.recurringOptions.repeatEndDate,
      )

      if (repeatEndDate <= endDate) {
        throw new BadRequestException(
          '반복 일정의 종료일은 일정의 종료일보다 이후여야 합니다.',
        )
      }

      this.validateRecurringOptions(createScheduleDto.recurringOptions)
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      userUuid,
      category,
      isRecurring: !!createScheduleDto.recurringOptions,
    })

    if (schedule.isAllDay) {
      ;[schedule.startDate, schedule.endDate] =
        this.scheduleUtils.adjustDateForAllDay(
          schedule.startDate,
          schedule.endDate,
        )
    }

    const savedSchedule = await this.schedulesRepository.save(schedule)

    if (schedule.isRecurring && createScheduleDto.recurringOptions) {
      const recurring = this.recurringRepository.create({
        scheduleId: savedSchedule.scheduleId,
        repeatType: createScheduleDto.recurringOptions.repeatType,
        repeatEndDate: createScheduleDto.recurringOptions.repeatEndDate,
        recurringInterval: createScheduleDto.recurringOptions.recurringInterval,
        recurringDaysOfWeek:
          createScheduleDto.recurringOptions.recurringDaysOfWeek,
        recurringDayOfMonth:
          createScheduleDto.recurringOptions.recurringDayOfMonth,
        recurringMonthOfYear:
          createScheduleDto.recurringOptions.recurringMonthOfYear,
      })

      const savedRecurring = await this.recurringRepository.save(recurring)
      savedSchedule.recurring = savedRecurring
    }

    if (createScheduleDto.groupInfo && createScheduleDto.groupInfo.length > 0) {
      await this.groupService.linkScheduleToGroupsAndUsers(
        savedSchedule,
        createScheduleDto.groupInfo,
      )
    }

    return this.scheduleUtils.convertToResponseDto(savedSchedule)
  }

  /**
   * 반복 일정 옵션 유효성을 검사합니다.
   */
  private validateRecurringOptions(recurringOptions: RecurringInfo) {
    const {
      repeatType,
      recurringDaysOfWeek,
      recurringDayOfMonth,
      recurringMonthOfYear,
    } = recurringOptions

    switch (repeatType) {
      case 'weekly':
        if (recurringMonthOfYear !== undefined) {
          throw new BadRequestException(
            '주간 반복에서는 monthOfYear를 설정할 수 없습니다.',
          )
        }
        if (!recurringDaysOfWeek || recurringDaysOfWeek.length === 0) {
          throw new BadRequestException(
            '주간 반복에서는 daysOfWeek를 반드시 설정해야 합니다.',
          )
        }
        break
      case 'monthly':
        if (recurringMonthOfYear !== undefined) {
          throw new BadRequestException(
            '월간 반복에서는 monthOfYear를 설정할 수 없습니다.',
          )
        }
        if (recurringDayOfMonth === undefined) {
          throw new BadRequestException(
            '월간 반복에서는 dayOfMonth를 반드시 설정해야 합니다.',
          )
        }
        break
      case 'yearly':
        if (recurringMonthOfYear === undefined) {
          throw new BadRequestException(
            '연간 반복에서는 monthOfYear를 반드시 설정해야 합니다.',
          )
        }
        if (recurringDayOfMonth === undefined) {
          throw new BadRequestException(
            '연간 반복에서는 dayOfMonth를 반드시 설정해야 합니다.',
          )
        }
        break
    }
  }

  /**
   * 기존 일정을 수정합니다.
   */
  @Transactional()
  async updateSchedule(
    userUuid: string,
    scheduleId: number,
    updateScheduleDto: UpdateScheduleDto,
    instanceDate: Date,
    updateType: 'single' | 'future' = 'single',
  ): Promise<ResponseScheduleDto> {
    let schedule = await this.schedulesRepository.findOne({
      where: { scheduleId, userUuid },
      relations: ['category', 'recurring'],
    })

    // 사용자가 생성한 일정이 아니라면 공유 받은 일정인지 찾음
    if (!schedule) {
      schedule = await this.findSharedGroupSchedulesByScheduleId(
        userUuid,
        scheduleId,
      )
    }

    if (!schedule) {
      throw new NotFoundException(
        `해당 ID : ${scheduleId}를 가진 일정을 찾을 수 없습니다.`,
      )
    }

    const isCreator = schedule.userUuid === userUuid

    if (schedule.isRecurring && instanceDate) {
      const isValidDate = this.isOccurrenceDate(schedule, instanceDate)
      if (!isValidDate) {
        throw new BadRequestException(
          `지정된 날짜 ${instanceDate}는 이 반복 일정의 유효한 날짜가 아닙니다.`,
        )
      }
    }

    let updatedSchedule
    if (schedule.isRecurring) {
      // 반복 일정 수정
      updatedSchedule =
        updateType === 'single'
          ? await this.recurringSchedulesService.updateSingleInstance(
              schedule,
              updateScheduleDto,
              instanceDate,
            )
          : await this.recurringSchedulesService.updateFutureInstances(
              schedule,
              updateScheduleDto,
              instanceDate,
            )
    } else {
      // 일반 일정 수정
      updatedSchedule = await this.updateNonRecurringSchedule(
        schedule,
        updateScheduleDto,
      )
    }

    // 그룹 정보 업데이트 (일정 생성자만 가능)
    if (isCreator) {
      if (updateScheduleDto.addGroupInfo) {
        await this.groupService.linkScheduleToGroupsAndUsers(
          updatedSchedule,
          updateScheduleDto.addGroupInfo,
        )
      }
      if (updateScheduleDto.deleteGroupInfo) {
        await this.groupService.removeGroupMembersFromSchedule(
          updatedSchedule.scheduleId,
          updateScheduleDto.deleteGroupInfo,
        )
      }
    }

    return updatedSchedule
  }

  private async updateNonRecurringSchedule(
    schedule: Schedule,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    const { categoryId, ...updateData } = updateScheduleDto

    // 제공된 필드만 업데이트
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        schedule[key] = value
      }
    })

    if (updateData.isAllDay) {
      ;[schedule.startDate, schedule.endDate] =
        this.scheduleUtils.adjustDateForAllDay(
          schedule.startDate,
          schedule.endDate,
        )
    }

    // 카테고리 ID가 제공된 경우에만 카테고리 업데이트
    if (categoryId !== undefined) {
      const newCategory = await this.categoryRepository.findOne({
        where: { categoryId },
      })
      if (newCategory) {
        schedule.category = newCategory
      }
    }

    // 변경된 일정 저장
    const updatedSchedule = await this.schedulesRepository.save(schedule)

    return this.scheduleUtils.convertToResponseDto(updatedSchedule)
  }

  /**
   * 일정을 삭제합니다.
   */
  @Transactional()
  async deleteSchedule(
    userUuid: string,
    scheduleId: number,
    instanceDate: string,
    deleteType: 'single' | 'future' = 'single',
  ): Promise<void> {
    // 일정 조회
    let schedule = await this.schedulesRepository.findOne({
      where: { scheduleId, userUuid },
      relations: ['recurring'],
    })
    let isCreator = true

    // 공유 받은 일정인지 확인
    if (!schedule) {
      schedule = await this.findSharedGroupSchedulesByScheduleId(
        userUuid,
        scheduleId,
      )
      isCreator = false
    }

    if (!schedule) {
      throw new NotFoundException(
        `ID가 ${scheduleId}인 일정을 찾을 수 없습니다.`,
      )
    }

    const targetDate = new Date(instanceDate)

    if (schedule.isRecurring) {
      if (
        schedule.recurring.repeatEndDate &&
        schedule.recurring.repeatEndDate < targetDate
      ) {
        throw new BadRequestException(
          '삭제하려는 날짜가 반복 일정의 종료일보다 늦습니다.',
        )
      }

      if (isCreator) {
        if (deleteType === 'future') {
          await this.recurringSchedulesService.deleteFutureInstances(
            schedule,
            targetDate,
          )
        } else {
          await this.recurringSchedulesService.deleteSingleInstance(
            schedule,
            targetDate,
          )
        }
      } else {
        // 공유 받은 사용자라면 해당 날짜 이후의 그룹 일정에서만 제거
        await this.removeUserFromFutureGroupSchedules(userUuid, schedule)
      }
    } else {
      if (isCreator) {
        // 일정 생성자인 경우 일정과 관련된 모든 그룹 일정 삭제
        await this.groupScheduleRepository.delete({
          schedule: { scheduleId },
        })
        await this.schedulesRepository.remove(schedule)
      } else {
        // 공유 받은 사용자인 경우 해당 사용자의 그룹 일정만 삭제
        await this.groupScheduleRepository.delete({
          schedule: { scheduleId },
          userUuid,
        })
      }
    }
  }

  private async removeUserFromFutureGroupSchedules(
    userUuid: string,
    schedule: Schedule,
  ): Promise<void> {
    await this.groupScheduleRepository.delete({
      schedule: { scheduleId: schedule.scheduleId },
      userUuid,
    })
  }

  /**
   * 특정 날짜 이후의 반복 일정을 삭제합니다.
   */
  private async deleteFutureInstances(
    schedule: Schedule,
    targetDate: Date,
  ): Promise<void> {
    if (targetDate.getTime() === schedule.startDate.getTime()) {
      // 시작일부터 삭제하는 경우 전체 삭제
      await this.recurringRepository.delete({
        scheduleId: schedule.scheduleId,
      })
      await this.schedulesRepository.remove(schedule)
    } else {
      // 중간부터 삭제하는 경우 종료일 수정
      const modifiedEndDate = new Date(
        targetDate.getTime() - 24 * 60 * 60 * 1000,
      )
      modifiedEndDate.setUTCHours(23, 59, 59, 999)

      await this.recurringRepository.update(schedule.recurring.recurringId, {
        repeatEndDate: modifiedEndDate,
      })
    }
  }

  // 헬퍼 메서드

  private async findRecurringSchedules(userUuid: string): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { userUuid, isRecurring: true },
      relations: ['category', 'recurring'],
    })
  }

  private async findRegularSchedulesInRange(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: {
        userUuid,
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
        isRecurring: false,
      },
      relations: ['category', 'recurring'],
    })
  }

  private expandRecurringSchedules(
    schedules: Schedule[],
    startDate: Date,
    endDate: Date,
  ): Schedule[] {
    const expandedSchedules: Schedule[] = []

    for (const schedule of schedules) {
      const recurring = schedule.recurring
      if (!recurring) continue

      if (recurring.repeatEndDate && recurring.repeatEndDate < startDate) {
        continue
      }

      let currentDate = new Date(schedule.startDate)
      const scheduleEndDate = recurring.repeatEndDate || endDate

      while (currentDate <= scheduleEndDate && currentDate <= endDate) {
        if (this.isOccurrenceDate(schedule, currentDate)) {
          const newSchedule = this.createOccurrence(schedule, currentDate)
          if (
            newSchedule.startDate <= endDate &&
            newSchedule.endDate >= startDate
          ) {
            if (schedule.recurring) {
              newSchedule.recurring = schedule.recurring
              newSchedule.isRecurring = true
            }
            expandedSchedules.push(newSchedule)
          }
        }
        currentDate = this.getNextOccurrenceDate(schedule, currentDate)
      }
    }

    return expandedSchedules
  }

  private isOccurrenceDate(schedule: Schedule, date: Date): boolean {
    if (!schedule.recurring) return false

    switch (schedule.recurring.repeatType) {
      case 'daily':
        return true
      case 'weekly':
        return schedule.recurring.recurringDaysOfWeek?.includes(date.getDay())
      case 'monthly':
        return date.getDate() === schedule.recurring.recurringDayOfMonth
      case 'yearly':
        return (
          date.getMonth() === schedule.recurring.recurringMonthOfYear &&
          date.getDate() === schedule.recurring.recurringDayOfMonth
        )
      default:
        return false
    }
  }

  private getNextOccurrenceDate(schedule: Schedule, currentDate: Date): Date {
    const nextDate = new Date(currentDate)
    const recurring = schedule.recurring
    const interval = recurring.recurringInterval || 1

    switch (recurring.repeatType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval)
        break
      case 'weekly':
        do {
          nextDate.setDate(nextDate.getDate() + 1)
        } while (!recurring.recurringDaysOfWeek?.includes(nextDate.getDay()))
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval)
        nextDate.setDate(recurring.recurringDayOfMonth)
        break
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval)
        nextDate.setMonth(recurring.recurringMonthOfYear)
        nextDate.setDate(recurring.recurringDayOfMonth)
        break
    }

    return nextDate
  }

  private createOccurrence(schedule: Schedule, startDate: Date): Schedule {
    const duration = schedule.endDate.getTime() - schedule.startDate.getTime()
    const endDate = new Date(startDate.getTime() + duration)

    const occurrence = new Schedule()
    Object.assign(occurrence, {
      ...schedule,
      scheduleId: schedule.scheduleId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isRecurring: true,
      recurring: schedule.recurring,
    })

    return occurrence
  }

  private async getCategoryById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId: categoryId },
    })

    if (!category) {
      throw new NotFoundException(
        `전달받은 카테고리 ID인 ${categoryId}는 존재하지 않는 카테고리입니다.`,
      )
    }

    return category
  }

  private async validateUser(userUuid: string) {
    const userExists = await this.usersService.checkUserExists(userUuid)
    if (!userExists) {
      throw new NotFoundException(
        `해당 UUID : ${userUuid} 를 가진 사용자는 없습니다.`,
      )
    }
  }
}
