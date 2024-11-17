import { Category } from './category.entity';
import { GroupSchedule } from './group-schedule.entity';
import { User } from './user.entity';
export declare class Schedule {
    scheduleId: number;
    userUuid: string;
    user: User;
    category: Category;
    startDate: Date;
    endDate: Date;
    title?: string;
    place?: string;
    memo?: string;
    isAllDay?: boolean;
    isGroupSchedule: boolean;
    repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatEndDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    groupSchedules: GroupSchedule[];
    isRecurring: boolean;
    recurringInterval?: number;
    recurringDaysOfWeek: number[];
    recurringDayOfMonth?: number;
    recurringMonthOfYear?: number;
}
