import { GroupSchedule } from '@/entities/group-schedule.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ResponseGroupInfo,
  ResponseScheduleDto,
} from './dto/response-schedule.dto'
import { Schedule } from '@/entities/schedule.entity'

@Injectable()
export class ScheduleUtils {
  constructor(
    @InjectRepository(GroupSchedule)
    private readonly groupScheduleRepository: Repository<GroupSchedule>,
  ) {}

  public async convertToResponseDto(
    schedule: Schedule,
  ): Promise<ResponseScheduleDto> {
    const groupSchedules = await this.groupScheduleRepository.find({
      where: { schedule: { scheduleId: schedule.scheduleId } },
      relations: ['group', 'user'],
    })

    const groupInfo = this.mapGroupSchedulesToGroupInfo(groupSchedules)

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

  private mapGroupSchedulesToGroupInfo(
    groupSchedules: GroupSchedule[],
  ): ResponseGroupInfo[] {
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

    return Array.from(groupMap.values())
  }
}
