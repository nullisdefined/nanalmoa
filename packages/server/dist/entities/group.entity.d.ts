import { UserGroup } from './user-group.entity';
import { GroupSchedule } from './group-schedule.entity';
import { GroupInvitation } from './group-invitation.entity';
export declare class Group {
    groupId: number;
    groupName: string;
    userGroups: UserGroup[];
    groupSchedules: GroupSchedule[];
    invitations: GroupInvitation[];
    createdAt: Date;
    updatedAt: Date;
}
