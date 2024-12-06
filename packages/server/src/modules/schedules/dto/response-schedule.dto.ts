import { Category } from '@/entities/category.entity'
import { UserInfo } from '@/modules/users/dto/user-info-detail.dto'

export class ResponseGroupInfo {
  groupId: number
  groupName: string
  users: UserInfo[]
}

export class RecurringInfoResponse {
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  repeatEndDate: Date
  interval?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  monthOfYear?: number
}

export class ResponseScheduleDto {
  scheduleId: number
  userUuid: string
  category: Category
  title: string
  place: string
  memo: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  recurringInfo?: RecurringInfoResponse
  groupInfo?: ResponseGroupInfo[]

  constructor(params: {
    scheduleId: number
    userUuid: string
    category: Category
    title?: string
    place?: string
    memo?: string
    startDate: Date
    endDate: Date
    isAllDay?: boolean
    recurring?: {
      repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
      repeatEndDate?: Date
      recurringInterval?: number
      recurringDaysOfWeek?: number[]
      recurringDayOfMonth?: number
      recurringMonthOfYear?: number
    }
    groupInfo?: ResponseGroupInfo[]
  }) {
    this.scheduleId = params.scheduleId
    this.userUuid = params.userUuid
    this.category = params.category
    this.title = params.title || ''
    this.place = params.place || ''
    this.memo = params.memo || ''
    this.startDate = params.startDate
    this.endDate = params.endDate
    this.isAllDay = params.isAllDay || false

    if (params.recurring) {
      this.recurringInfo = {
        repeatType: params.recurring.repeatType,
        repeatEndDate: params.recurring.repeatEndDate,
        interval: params.recurring.recurringInterval,
        daysOfWeek: params.recurring.recurringDaysOfWeek,
        dayOfMonth: params.recurring.recurringDayOfMonth,
        monthOfYear: params.recurring.recurringMonthOfYear,
      }
    }

    this.groupInfo = params.groupInfo
  }
}
