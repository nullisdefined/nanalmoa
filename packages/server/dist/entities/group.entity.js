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
exports.Group = void 0;
const typeorm_1 = require("typeorm");
const user_group_entity_1 = require("./user-group.entity");
const group_schedule_entity_1 = require("./group-schedule.entity");
const group_invitation_entity_1 = require("./group-invitation.entity");
let Group = class Group {
};
exports.Group = Group;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'group_id',
    }),
    __metadata("design:type", Number)
], Group.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'groupName' }),
    __metadata("design:type", String)
], Group.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_group_entity_1.UserGroup, (userGroup) => userGroup.group),
    __metadata("design:type", Array)
], Group.prototype, "userGroups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_schedule_entity_1.GroupSchedule, (groupSchedule) => groupSchedule.group),
    __metadata("design:type", Array)
], Group.prototype, "groupSchedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_invitation_entity_1.GroupInvitation, (invitation) => invitation.group),
    __metadata("design:type", Array)
], Group.prototype, "invitations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Group.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Group.prototype, "updatedAt", void 0);
exports.Group = Group = __decorate([
    (0, typeorm_1.Entity)('group')
], Group);
//# sourceMappingURL=group.entity.js.map