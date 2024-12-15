import { ScheduleRecurring } from '@/entities/recurring-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import OpenAI from 'openai'
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm'
import { GroupService } from '../group/group.service'
import { VoiceTranscriptionService } from './voice-transcription.service'
import { UsersService } from '../users/users.service'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import {
  ResponseGroupInfo,
  ResponseScheduleDto,
} from './dto/response-schedule.dto'
import { WeekQueryDto } from './dto/week-query-schedule.dto'
import { CreateScheduleDto, RecurringInfo } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { Category } from '@/entities/category.entity'

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
  ) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')
    this.openai = new OpenAI({ apiKey: openaiApiKey })
  }

  // 일정 조회 관련 메서드

  /**
   * 사용자의 모든 일정을 조회합니다.
   */
  async findAllByUserUuid(userUuid: string): Promise<ResponseScheduleDto[]> {
    const startDate = new Date(Date.UTC(2000, 0, 1))
    const endDate = new Date(Date.UTC(2100, 11, 31, 23, 59, 59, 999))
    return this.getSchedulesInRange(userUuid, startDate, endDate)
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
      allSchedules.map((schedule) => this.convertToResponseDto(schedule)),
    )

    return convertedSchedules
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
   * 월별 일정을 조회합니다.
   */
  async findByMonth(
    userUuid: string,
    year: number,
    month: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
    return this.getSchedulesInRange(userUuid, startDate, endDate)
  }

  /**
   * 주별 일정을 조회합니다.
   */
  async findByWeek(
    userUuid: string,
    date: string,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const inputDate = new Date(date)
    inputDate.setUTCHours(0, 0, 0, 0)
    const dayOfWeek = inputDate.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일부터 시작하도록 조정
    const weekStartDate = new Date(inputDate)
    weekStartDate.setDate(inputDate.getDate() + daysToMonday)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setUTCHours(23, 59, 59, 999)
    return this.getSchedulesInRange(userUuid, weekStartDate, weekEndDate)
  }

  /**
   * 일별 일정을 조회합니다.
   */
  async findByDate(dateQuery: WeekQueryDto): Promise<ResponseScheduleDto[]> {
    await this.validateUser(dateQuery.userUuid)
    const startOfDay = new Date(dateQuery.date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(dateQuery.date)
    endOfDay.setUTCHours(23, 59, 59, 999)
    return this.getSchedulesInRange(dateQuery.userUuid, startOfDay, endOfDay)
  }

  /**
   * 연도별 일정을 조회합니다.
   */
  async findByYear(
    userUuid: string,
    year: number,
  ): Promise<ResponseScheduleDto[]> {
    await this.validateUser(userUuid)
    const startDate = new Date(Date.UTC(year, 0, 1))
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
    return this.getSchedulesInRange(userUuid, startDate, endDate)
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
    return this.convertToResponseDto(schedule)
  }

  // 일정 생성 및 수정 관련 메서드

  /**
   * 새로운 일정을 생성합니다.
   */
  async createSchedule(
    userUuid: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<ResponseScheduleDto> {
    const category = await this.getCategoryById(
      createScheduleDto.categoryId ?? 7,
    )

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
      ;[schedule.startDate, schedule.endDate] = this.adjustDateForAllDay(
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

    return this.convertToResponseDto(savedSchedule)
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
      if (updateType === 'single') {
        updatedSchedule = await this.updateSingleInstance(
          schedule,
          updateScheduleDto,
          instanceDate,
        )
      } else {
        updatedSchedule = await this.updateFutureInstances(
          schedule,
          updateScheduleDto,
          instanceDate,
        )
      }
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

    return this.convertToResponseDto(updatedSchedule)
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

    // 카테고리 ID가 제공된 경우에만 카테고리 업데이트
    if (categoryId !== undefined) {
      const newCategory = await this.getCategoryById(categoryId)
      if (newCategory) {
        schedule.category = newCategory
      }
    }

    // 변경된 일정 저장
    const updatedSchedule = await this.schedulesRepository.save(schedule)

    return this.convertToResponseDto(updatedSchedule)
  }

  /**
   * 특정 날짜의 반복 일정을 수정합니다.
   */
  private async updateSingleInstance(
    schedule: Schedule,
    updateScheduleDto: UpdateScheduleDto,
    instanceDate: Date,
  ): Promise<ResponseScheduleDto> {
    // 1. 원본 반복 일정의 종료일을 수정 날짜 전날로 변경
    const originalEndDate = schedule.recurring.repeatEndDate
    const modifiedEndDate = new Date(
      instanceDate.getTime() - 24 * 60 * 60 * 1000,
    )
    await this.recurringRepository.update(schedule.recurring.recurringId, {
      repeatEndDate: modifiedEndDate,
    })

    // 2. 수정하려는 날짜의 단일 일정 생성
    const singleInstance = this.schedulesRepository.create({
      ...schedule,
      ...updateScheduleDto,
      scheduleId: undefined,
      isRecurring: false,
      recurring: null,
      startDate: new Date(instanceDate),
      endDate: new Date(instanceDate),
    })

    // 시간 설정
    singleInstance.startDate.setUTCHours(
      updateScheduleDto.startDate?.getUTCHours() ??
        schedule.startDate.getUTCHours(),
      updateScheduleDto.startDate?.getUTCMinutes() ??
        schedule.startDate.getUTCMinutes(),
    )
    singleInstance.endDate.setUTCHours(
      updateScheduleDto.endDate?.getUTCHours() ??
        schedule.endDate.getUTCHours(),
      updateScheduleDto.endDate?.getUTCMinutes() ??
        schedule.endDate.getUTCMinutes(),
    )

    const savedSingleInstance =
      await this.schedulesRepository.save(singleInstance)
    console.log('3. Saved single instance:', savedSingleInstance)

    // 3. 다음 날부터 시작하는 새로운 반복 일정 생성
    const nextDay = new Date(instanceDate)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setUTCHours(
      schedule.startDate.getUTCHours(),
      schedule.startDate.getUTCMinutes(),
      0,
      0,
    )

    const endTime = schedule.endDate.getTime() - schedule.startDate.getTime()
    const nextDayEnd = new Date(nextDay.getTime() + endTime)

    const newRecurringSchedule = this.schedulesRepository.create({
      userUuid: schedule.userUuid,
      category: schedule.category,
      title: schedule.title,
      place: schedule.place,
      memo: schedule.memo,
      isAllDay: schedule.isAllDay,
      startDate: nextDay,
      endDate: nextDayEnd,
      isRecurring: true,
    })

    console.log('4. Created new recurring schedule:', newRecurringSchedule)
    const savedNewSchedule =
      await this.schedulesRepository.save(newRecurringSchedule)
    console.log('5. Saved new recurring schedule:', savedNewSchedule)

    // 4. 새로운 반복 정보 생성
    const newRecurring = this.recurringRepository.create({
      scheduleId: savedNewSchedule.scheduleId,
      repeatType: schedule.recurring.repeatType,
      repeatEndDate: originalEndDate,
      recurringInterval: schedule.recurring.recurringInterval,
      recurringDaysOfWeek: schedule.recurring.recurringDaysOfWeek,
      recurringDayOfMonth: schedule.recurring.recurringDayOfMonth,
      recurringMonthOfYear: schedule.recurring.recurringMonthOfYear,
    })

    const savedRecurring = await this.recurringRepository.save(newRecurring)

    // 관계 설정
    savedNewSchedule.recurring = savedRecurring
    await this.schedulesRepository.save(savedNewSchedule)

    return this.convertToResponseDto(savedSingleInstance)
  }

  /**
   * 특정 날짜 이후의 반복 일정을 수정합니다.
   */
  private async updateFutureInstances(
    schedule: Schedule,
    updateScheduleDto: UpdateScheduleDto,
    instanceDate: Date,
  ): Promise<ResponseScheduleDto> {
    const originalSchedule = { ...schedule }
    const originalRecurring = { ...schedule.recurring }

    // 1. 기존 일정 처리
    if (instanceDate.getTime() === schedule.startDate.getTime()) {
      // 시작일부터 수정하는 경우, 기존 recurring 정보를 먼저 삭제
      await this.recurringRepository.delete({ scheduleId: schedule.scheduleId })
      await this.schedulesRepository.remove(schedule)
    } else {
      // 중간 날짜부터 수정하는 경우, 기존 일정의 반복 종료일 수정
      const updatedRepeatEndDate = new Date(instanceDate)
      updatedRepeatEndDate.setUTCDate(updatedRepeatEndDate.getUTCDate() - 1)
      updatedRepeatEndDate.setUTCHours(23, 59, 59, 999)
      await this.recurringRepository.update(originalRecurring.recurringId, {
        repeatEndDate: updatedRepeatEndDate,
      })
    }

    // 2. 새로운 일정 생성
    const newSchedule = this.schedulesRepository.create({
      userUuid: schedule.userUuid,
      category: schedule.category,
      title: updateScheduleDto.title ?? schedule.title,
      place: updateScheduleDto.place ?? schedule.place,
      memo: updateScheduleDto.memo ?? schedule.memo,
      isAllDay: updateScheduleDto.isAllDay ?? schedule.isAllDay,
      startDate: new Date(instanceDate),
      isRecurring: true,
    })

    // 시간 설정
    newSchedule.startDate.setUTCHours(
      updateScheduleDto.startDate?.getUTCHours() ??
        schedule.startDate.getUTCHours(),
      updateScheduleDto.startDate?.getUTCMinutes() ??
        schedule.startDate.getUTCMinutes(),
      0,
      0,
    )

    if (updateScheduleDto.endDate) {
      newSchedule.endDate = new Date(updateScheduleDto.endDate)
    } else {
      const duration = schedule.endDate.getTime() - schedule.startDate.getTime()
      newSchedule.endDate = new Date(newSchedule.startDate.getTime() + duration)
    }

    // 3. 새로운 일정 저장
    const savedNewSchedule = await this.schedulesRepository.save(newSchedule)

    // 4. 새로운 반복 정보 생성 및 저장
    const newRecurring = this.recurringRepository.create({
      scheduleId: savedNewSchedule.scheduleId,
      repeatType:
        updateScheduleDto.recurringOptions?.repeatType ??
        originalRecurring.repeatType,
      repeatEndDate:
        updateScheduleDto.recurringOptions?.repeatEndDate ??
        originalRecurring.repeatEndDate,
      recurringInterval:
        updateScheduleDto.recurringOptions?.recurringInterval ??
        originalRecurring.recurringInterval,
      recurringDaysOfWeek:
        updateScheduleDto.recurringOptions?.recurringDaysOfWeek ??
        originalRecurring.recurringDaysOfWeek,
      recurringDayOfMonth:
        updateScheduleDto.recurringOptions?.recurringDayOfMonth ??
        originalRecurring.recurringDayOfMonth,
      recurringMonthOfYear:
        updateScheduleDto.recurringOptions?.recurringMonthOfYear ??
        originalRecurring.recurringMonthOfYear,
    })

    const savedRecurring = await this.recurringRepository.save(newRecurring)

    // 5. 관계 설정 및 최종 저장
    savedNewSchedule.recurring = savedRecurring
    await this.schedulesRepository.save(savedNewSchedule)

    return this.convertToResponseDto(savedNewSchedule)
  }

  /**
   * 일정을 삭제합니다.
   */
  async deleteSchedule(
    userUuid: string,
    scheduleId: number,
    instanceDate: string,
    deleteType: 'single' | 'future' = 'single',
  ): Promise<void> {
    // 일단 해당 ID로 사용자가 생성한 일정인지 찾음
    let schedule = await this.schedulesRepository.findOne({
      where: { scheduleId, userUuid },
      relations: ['recurring'],
    })
    let isCreator = true

    // 사용자가 생성한 일정이 아니라면 공유 받은 일정인지 찾음
    if (!schedule) {
      const sharedSchedules = await this.findSharedGroupSchedulesByScheduleId(
        userUuid,
        scheduleId,
      )
      schedule = sharedSchedules
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
          await this.deleteFutureInstances(schedule, targetDate)
        } else {
          await this.deleteSingleInstance(schedule, targetDate)
        }
      } else {
        // 공유 받은 사용자라면 해당 날짜 이후의 그룹 일정에서만 제거
        await this.removeUserFromFutureGroupSchedules(userUuid, schedule)
      }
    } else {
      if (isCreator) {
        // 일정 생성자인 경우 일정과 관련된 모든 그룹 일정 삭제
        await this.groupScheduleRepository.delete({ schedule: { scheduleId } })
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
      await this.recurringRepository.delete({ scheduleId: schedule.scheduleId })
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

  /**
   * 특정 날짜의 반복 일정 삭제
   */
  private async deleteSingleInstance(
    schedule: Schedule,
    targetDate: Date,
  ): Promise<void> {
    // 1. 기존 일정의 반복 패턴 종료일을 하루 전으로 수정
    const originalRecurring = { ...schedule.recurring }
    const modifiedEndDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)
    modifiedEndDate.setUTCHours(23, 59, 59, 999)

    // 기존 recurring 정보 수정
    await this.recurringRepository.update(originalRecurring.recurringId, {
      repeatEndDate: modifiedEndDate,
    })

    // 2. 다음날부터의 새로운 반복 일정 생성
    const nextStartDate = this.getNextOccurrenceDate(schedule, targetDate)
    if (nextStartDate <= originalRecurring.repeatEndDate) {
      // 새로운 일정 생성
      const newSchedule = new Schedule()
      Object.assign(newSchedule, {
        userUuid: schedule.userUuid,
        category: schedule.category,
        title: schedule.title,
        place: schedule.place,
        memo: schedule.memo,
        isAllDay: schedule.isAllDay,
        startDate: nextStartDate,
        endDate: new Date(
          nextStartDate.getTime() +
            (schedule.endDate.getTime() - schedule.startDate.getTime()),
        ),
        isRecurring: true,
      })

      const savedNewSchedule = await this.schedulesRepository.save(newSchedule)

      // 새로운 recurring 정보 생성
      const newRecurring = new ScheduleRecurring()
      Object.assign(newRecurring, {
        scheduleId: savedNewSchedule.scheduleId,
        repeatType: originalRecurring.repeatType,
        repeatEndDate: originalRecurring.repeatEndDate,
        recurringInterval: originalRecurring.recurringInterval,
        recurringDaysOfWeek: originalRecurring.recurringDaysOfWeek,
        recurringDayOfMonth: originalRecurring.recurringDayOfMonth,
        recurringMonthOfYear: originalRecurring.recurringMonthOfYear,
      })

      await this.recurringRepository.save(newRecurring)
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

  private adjustDateForAllDay(startDate: Date, endDate: Date): [Date, Date] {
    return [
      new Date(startDate.setHours(0, 0, 0, 0)),
      new Date(endDate.setHours(23, 59, 59, 999)),
    ]
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

  private async convertToResponseDto(
    schedule: Schedule,
  ): Promise<ResponseScheduleDto> {
    const groupSchedules = await this.groupScheduleRepository.find({
      where: { schedule: { scheduleId: schedule.scheduleId } },
      relations: ['group', 'user'],
    })

    const groupMap = new Map<number, ResponseGroupInfo>()

    groupSchedules.forEach((groupSchedule) => {
      const { group, user } = groupSchedule
      if (!groupMap.has(group.groupId)) {
        groupMap.set(group.groupId, {
          groupId: group.groupId,
          groupName: group.groupName,
          users: [],
        })
      }
      groupMap.get(group.groupId).users.push({
        userUuid: user.userUuid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
      })
    })

    const groupInfo = Array.from(groupMap.values())

    return new ResponseScheduleDto({
      scheduleId: schedule.scheduleId,
      userUuid: schedule.userUuid,
      category: schedule.category,
      title: schedule.title,
      place: schedule.place,
      memo: schedule.memo,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      isAllDay: schedule.isAllDay,
      recurring: schedule.recurring,
      groupInfo: groupInfo.length > 0 ? groupInfo : undefined,
    })
  }

  // GPT 관련 메서드

  /**
   * GPT 응답을 파싱합니다.
   */
  parseGptResponse(response: string): any[] {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      throw new Error('Failed to parse GPT response')
    }
  }

  /**
   * 전사 데이터를 OpenAI GPT 모델에 넘겨서 처리합니다.
   */
  private async processWithGpt(
    transcriptionResult: any,
    currentDateTime: string,
  ): Promise<CreateScheduleDto[]> {
    const formattedDate = await this.formatDateToYYYYMMDDHHMMSS(
      new Date(currentDateTime),
    )

    const gptResponse = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_FINETUNING_MODEL'),
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that extracts startDate, endDate, title, place, isAllDay, and category information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
        },
        {
          role: 'user',
          content: `{Today : ${formattedDate}, conversations : ${transcriptionResult}}`,
        },
      ],
    })
    const gptResponseContent = gptResponse.choices[0].message.content
    console.log(gptResponseContent)

    const parsedResponse = this.parseGptResponse(gptResponseContent)
    return this.convertGptResponseToCreateScheduleDto(parsedResponse)
  }

  /**
   * OCR 결과를 OpenAI GPT 모델에 넘겨서 처리합니다.
   */
  async processWithGptOCR(OCRResult: string): Promise<any> {
    const gptResponse = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_FINETUNING_MODEL_OCR'),
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that extracts startDate, endDate, category, intent, isAllDay and place information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
        },
        {
          role: 'user',
          content: `${OCRResult}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    })

    const gptResponseContent = gptResponse.choices[0].message.content
    return this.parseGptResponse(gptResponseContent)
  }

  /**
   * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 변환합니다.
   */
  private async formatDateToYYYYMMDDHHMMSS(date: Date): Promise<string> {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  private async convertGptResponseToCreateScheduleDto(
    gptEvents: any[],
  ): Promise<CreateScheduleDto[]> {
    const allCategories = await this.categoryRepository.find()
    const categoryMap = allCategories.reduce((acc, category) => {
      acc[category.categoryName] = category.categoryId
      return acc
    }, {})
    console.log(gptEvents)
    return gptEvents.map((event) => {
      const dto = new CreateScheduleDto()
      dto.startDate = new Date(event.startDate)
      dto.endDate = new Date(event.endDate)
      dto.title = event.intent || event.title || '새로운 일정'
      dto.place = event.place || ''
      dto.isAllDay = event.isAllDay || false
      dto.categoryId = categoryMap[event.category] || 7 // 7은 '기타' 카테고리의 ID로 가정
      return dto
    })
  }

  /**
   * RTZR을 사용하여 음성을 전사하고 GPT로 처리합니다.
   */
  async transcribeRTZRAndFetchResultWithGpt(
    file: Express.Multer.File,
    currentDateTime: string,
    userUuid: string,
  ) {
    await this.validateUser(userUuid)
    const transcribe =
      await this.voiceTranscriptionService.RTZRTranscribeResult(file)
    return this.processWithGpt(transcribe, currentDateTime)
  }

  /**
   * Whisper를 사용하여 음성을 전사하고 GPT로 처리합니다.
   */
  async transcribeWhisperAndFetchResultWithGpt(
    file: Express.Multer.File,
    currentDateTime: string,
    userUuid: string,
  ) {
    await this.validateUser(userUuid)
    const transcribe =
      await this.voiceTranscriptionService.whisperTranscribeResult(file)
    return this.processWithGpt(transcribe, currentDateTime)
  }
}
