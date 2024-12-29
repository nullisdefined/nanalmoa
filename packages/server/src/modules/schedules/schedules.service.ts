import { ScheduleRecurring } from '@/entities/recurring-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import OpenAI from 'openai'
import { Repository } from 'typeorm'
import { GroupService } from '../group/group.service'
import { VoiceTranscriptionService } from './voice-transcription.service'
import { UsersService } from '../users/users.service'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { WeekQueryDto } from './dto/week-query-schedule.dto'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { Category } from '@/entities/category.entity'
import { Transactional } from 'typeorm-transactional'
import { RecurringSchedulesService } from './recurring-schedules.service'
import { ScheduleUtils } from './schedules.util'
import { GroupScheduleService } from './group-schedules.service'

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
    private readonly groupScheduleService: GroupScheduleService,
  ) {}

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
    await this.usersService.getUserByUuid(userUuid)
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
    await this.usersService.getUserByUuid(userUuid)
    const inputDate = new Date(date)
    const dateRange = this.scheduleUtils.calculateWeeklyRange(inputDate)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  async findByDate(dateQuery: WeekQueryDto): Promise<ResponseScheduleDto[]> {
    await this.usersService.getUserByUuid(dateQuery.userUuid)
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
    await this.usersService.getUserByUuid(userUuid)
    const dateRange = this.scheduleUtils.calculateYearlyRange(year)
    return this.getSchedulesInRange(
      userUuid,
      dateRange.startDate,
      dateRange.endDate,
    )
  }

  async getSchedulesInRange(
    userUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ResponseScheduleDto[]> {
    const [regularSchedules, recurringSchedules] = await Promise.all([
      this.recurringSchedulesService.findRegularSchedulesInRange(
        userUuid,
        startDate,
        endDate,
      ),
      this.recurringSchedulesService.findRecurringSchedules(userUuid),
    ])

    const expandedRecurringSchedules =
      this.recurringSchedulesService.expandRecurringSchedules(
        recurringSchedules,
        startDate,
        endDate,
      )

    const sharedGroupSchedules =
      await this.groupScheduleService.findSharedGroupSchedules(
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

      this.recurringSchedulesService.validateRecurringOptions(
        createScheduleDto.recurringOptions,
      )
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
      schedule =
        await this.groupScheduleService.findSharedGroupSchedulesByScheduleId(
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
      const isValidDate = this.recurringSchedulesService.isOccurrenceDate(
        schedule,
        instanceDate,
      )
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
      schedule =
        await this.groupScheduleService.findSharedGroupSchedulesByScheduleId(
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
        await this.groupScheduleService.removeUserFromFutureGroupSchedules(
          userUuid,
          schedule,
        )
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
}
