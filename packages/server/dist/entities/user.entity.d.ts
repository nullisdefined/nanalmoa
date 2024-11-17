import { Auth } from './auth.entity';
import { Schedule } from './schedule.entity';
import { UserRoutine } from './user-routine.entity';
import { GroupInvitation } from './group-invitation.entity';
import { GroupSchedule } from './group-schedule.entity';
export declare class User {
    userId: number;
    userUuid: string;
    generateUuid(): void;
    name?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string;
    phoneNumber?: string;
    isManager: boolean;
    address?: string;
    auths?: Auth[];
    schedules?: Schedule[];
    routine?: UserRoutine;
    sentGroupInvitations?: GroupInvitation[];
    receivedGroupInvitations?: GroupInvitation[];
    groupSchedules?: GroupSchedule[];
}
