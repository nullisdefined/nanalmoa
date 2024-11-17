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
exports.GroupSchedule = void 0;
const typeorm_1 = require("typeorm");
const group_entity_1 = require("./group.entity");
const schedule_entity_1 = require("./schedule.entity");
const user_entity_1 = require("./user.entity");
let GroupSchedule = class GroupSchedule {
};
exports.GroupSchedule = GroupSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'group_schedule_id' }),
    __metadata("design:type", Number)
], GroupSchedule.prototype, "groupScheduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_uuid' }),
    __metadata("design:type", String)
], GroupSchedule.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group, (group) => group.groupSchedules),
    (0, typeorm_1.JoinColumn)({ name: 'group_id' }),
    __metadata("design:type", group_entity_1.Group)
], GroupSchedule.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => schedule_entity_1.Schedule, (schedule) => schedule.groupSchedules),
    (0, typeorm_1.JoinColumn)({ name: 'schedule_id' }),
    __metadata("design:type", schedule_entity_1.Schedule)
], GroupSchedule.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GroupSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GroupSchedule.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.groupSchedules),
    (0, typeorm_1.JoinColumn)({ name: 'user_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], GroupSchedule.prototype, "user", void 0);
exports.GroupSchedule = GroupSchedule = __decorate([
    (0, typeorm_1.Entity)('group_schedule')
], GroupSchedule);
//# sourceMappingURL=group-schedule.entity.js.map