import { Category } from '@/entities/category.entity';
import { UserInfo } from '@/modules/users/dto/user-info-detail.dto';
export declare class ResponseGroupInfo {
    groupId: number;
    groupName: string;
    users: UserInfo[];
}
export declare class ResponseScheduleDto {
    scheduleId: number;
    userUuid: string;
    startDate: Date;
    endDate: Date;
    title: string;
    place?: string;
    memo?: string;
    isAllDay: boolean;
    category: Category;
    isRecurring: boolean;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatEndDate?: Date;
    recurringInterval?: number;
    recurringDaysOfWeek?: number[];
    recurringDayOfMonth?: number;
    recurringMonthOfYear?: number;
    groupInfo?: ResponseGroupInfo[];
    isGroupSchedule: boolean;
    constructor(partial: Partial<ResponseScheduleDto>);
}
