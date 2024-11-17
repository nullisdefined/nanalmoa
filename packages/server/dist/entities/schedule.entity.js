"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./category.entity");
const group_schedule_entity_1 = require("./group-schedule.entity");
const user_entity_1 = require("./user.entity");
let Schedule = class Schedule {
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'schedule_id' }),
    __metadata("design:type", Number)
], Schedule.prototype, "scheduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_uuid', type: 'uuid' }),
    __metadata("design:type", String)
], Schedule.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'user_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], Schedule.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Schedule.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, default: '새로운 일정' }),
    __metadata("design:type", String)
], Schedule.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "place", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "memo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_all_day', nullable: true }),
    __metadata("design:type", Boolean)
], Schedule.prototype, "isAllDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_group_schedule', default: false }),
    __metadata("design:type", Boolean)
], Schedule.prototype, "isGroupSchedule", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'repeat_type',
        type: 'enum',
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        nullable: true,
    }),
    __metadata("design:type", String)
], Schedule.prototype, "repeatType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'repeat_end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Schedule.prototype, "repeatEndDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Schedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Schedule.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_schedule_entity_1.GroupSchedule, (groupSchedule) => groupSchedule.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "groupSchedules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_recurring', default: false }),
    __metadata("design:type", Boolean)
], Schedule.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurring_interval', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Schedule.prototype, "recurringInterval", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        array: true,
        nullable: true,
        name: 'recurring_days_of_week',
    }),
    __metadata("design:type", Array)
], Schedule.prototype, "recurringDaysOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurring_day_of_month', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Schedule.prototype, "recurringDayOfMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurring_month_of_year', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Schedule.prototype, "recurringMonthOfYear", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedule')
], Schedule);
//# sourceMappingURL=schedule.entity.js.map