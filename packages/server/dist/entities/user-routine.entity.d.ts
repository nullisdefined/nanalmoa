import { User } from './user.entity';
export declare class UserRoutine {
    userRoutineId: number;
    userUuid: string;
    wakeUpTime: string;
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
    bedTime: string;
    updatedAt: Date;
    user: User;
}
