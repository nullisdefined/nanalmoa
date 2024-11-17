import { GroupInfo } from './create-schedule.dto';
export declare class UpdateScheduleDto {
    startDate?: Date;
    endDate?: Date;
    title?: string;
    place?: string;
    memo?: string;
    isAllDay?: boolean;
    categoryId?: number;
    isRecurring?: boolean;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatEndDate?: Date;
    recurringInterval?: number;
    recurringDaysOfWeek?: number[];
    recurringDayOfMonth?: number;
    recurringMonthOfYear?: number;
    addGroupInfo?: GroupInfo[];
    deleteGroupInfo?: GroupInfo[];
}
