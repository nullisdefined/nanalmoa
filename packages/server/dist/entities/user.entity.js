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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const auth_entity_1 = require("./auth.entity");
const schedule_entity_1 = require("./schedule.entity");
const user_routine_entity_1 = require("./user-routine.entity");
const group_invitation_entity_1 = require("./group-invitation.entity");
const group_schedule_entity_1 = require("./group-schedule.entity");
let User = class User {
    generateUuid() {
        if (!this.userUuid) {
            this.userUuid = (0, uuid_1.v4)();
        }
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], User.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true, name: 'user_uuid' }),
    __metadata("design:type", String)
], User.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "generateUuid", null);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, name: 'name', default: '' }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'profile_image', default: '' }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, name: 'email', default: '' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 20,
        unique: true,
        nullable: true,
        name: 'phone_number',
        default: '',
    }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_manager' }),
    __metadata("design:type", Boolean)
], User.prototype, "isManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'address', default: '' }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => auth_entity_1.Auth, (auth) => auth.user),
    __metadata("design:type", Array)
], User.prototype, "auths", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.user),
    __metadata("design:type", Array)
], User.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_routine_entity_1.UserRoutine, (userRoutine) => userRoutine.user),
    __metadata("design:type", user_routine_entity_1.UserRoutine)
], User.prototype, "routine", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_invitation_entity_1.GroupInvitation, (invitation) => invitation.inviter),
    __metadata("design:type", Array)
], User.prototype, "sentGroupInvitations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_invitation_entity_1.GroupInvitation, (invitation) => invitation.invitee),
    __metadata("design:type", Array)
], User.prototype, "receivedGroupInvitations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_schedule_entity_1.GroupSchedule, (groupSchedule) => groupSchedule.user),
    __metadata("design:type", Array)
], User.prototype, "groupSchedules", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('user')
], User);
//# sourceMappingURL=user.entity.js.map