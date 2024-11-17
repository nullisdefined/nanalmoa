import { Group } from './group.entity';
import { Schedule } from './schedule.entity';
import { User } from './user.entity';
export declare class GroupSchedule {
    groupScheduleId: number;
    userUuid: string;
    group: Group;
    schedule: Schedule;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
