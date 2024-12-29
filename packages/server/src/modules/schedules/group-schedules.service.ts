import { GroupSchedule } from '@/entities/group-schedule.entity'
import { Schedule } from '@/entities/schedule.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class GroupScheduleService {
  constructor(
    @InjectRepository(GroupSchedule)
    private groupScheduleRepository: Repository<GroupSchedule>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async findSharedGroupSchedules(
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

  async findSharedGroupSchedulesByScheduleId(
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

  async removeUserFromFutureGroupSchedules(
    userUuid: string,
    schedule: Schedule,
  ): Promise<void> {
    await this.groupScheduleRepository.delete({
      schedule: { scheduleId: schedule.scheduleId },
      userUuid,
    })
  }
}
