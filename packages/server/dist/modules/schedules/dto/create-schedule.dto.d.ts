export declare class GroupInfo {
    groupId: number;
    userUuids: string[];
}
export declare class CreateScheduleDto {
    startDate: Date;
    endDate: Date;
    title?: string;
    place?: string;
    memo?: string;
    isAllDay?: boolean;
    categoryId?: number;
    isRecurring: boolean;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatEndDate?: Date;
    recurringInterval?: number;
    recurringDaysOfWeek?: number[];
    recurringDayOfMonth?: number;
    recurringMonthOfYear?: number;
    groupInfo?: GroupInfo[];
}
