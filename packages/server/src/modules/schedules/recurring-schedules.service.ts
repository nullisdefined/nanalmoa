import { Schedule } from '@/entities/schedule.entity'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ResponseScheduleDto } from './dto/response-schedule.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { ScheduleRecurring } from '@/entities/recurring-schedule.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ScheduleUtils } from './schedules.util'
import { RecurringInfo } from './dto/create-schedule.dto'

@Injectable()
export class RecurringSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(ScheduleRecurring)
    private recurringRepository: Repository<ScheduleRecurring>,
    private readonly scheduleUtils: ScheduleUtils,
  ) {}

  public async updateSingleInstance(
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

    const savedNewSchedule =
      await this.schedulesRepository.save(newRecurringSchedule)

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

    return this.scheduleUtils.convertToResponseDto(savedSingleInstance)
  }

  public async updateFutureInstances(
    schedule: Schedule,
    updateScheduleDto: UpdateScheduleDto,
    instanceDate: Date,
  ): Promise<ResponseScheduleDto> {
    // const originalSchedule = { ...schedule }
    const originalRecurring = { ...schedule.recurring }

    // 1. 기존 일정 처리
    if (instanceDate.getTime() === schedule.startDate.getTime()) {
      // 시작일부터 수정하는 경우, 기존 recurring 정보를 먼저 삭제
      await this.recurringRepository.delete({
        scheduleId: schedule.scheduleId,
      })
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

    return this.scheduleUtils.convertToResponseDto(savedNewSchedule)
  }

  public async deleteFutureInstances(
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

  public async deleteSingleInstance(
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
      const newSchedule = this.schedulesRepository.create({
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
      const newRecurring = this.recurringRepository.create({
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

  public async findRecurringSchedules(userUuid: string): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { userUuid, isRecurring: true },
      relations: ['category', 'recurring'],
    })
  }

  public async findRegularSchedulesInRange(
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

  public expandRecurringSchedules(
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

  public isOccurrenceDate(schedule: Schedule, date: Date): boolean {
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

  public getNextOccurrenceDate(schedule: Schedule, currentDate: Date): Date {
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

  public createOccurrence(schedule: Schedule, startDate: Date): Schedule {
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

  public validateRecurringOptions(recurringOptions: RecurringInfo) {
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
}
