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
exports.GroupInvitation = void 0;
const typeorm_1 = require("typeorm");
const group_entity_1 = require("./group.entity");
const manager_invitation_entity_1 = require("./manager-invitation.entity");
const user_entity_1 = require("./user.entity");
let GroupInvitation = class GroupInvitation {
};
exports.GroupInvitation = GroupInvitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'group_invitation_id',
    }),
    __metadata("design:type", Number)
], GroupInvitation.prototype, "groupInvitationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group, (group) => group.invitations),
    (0, typeorm_1.JoinColumn)({ name: 'group_id' }),
    __metadata("design:type", group_entity_1.Group)
], GroupInvitation.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inviter_uuid' }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "inviterUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invitee_uuid' }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "inviteeUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: manager_invitation_entity_1.InvitationStatus,
        default: manager_invitation_entity_1.InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GroupInvitation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GroupInvitation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedGroupInvitations),
    (0, typeorm_1.JoinColumn)({ name: 'invitee_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], GroupInvitation.prototype, "invitee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentGroupInvitations),
    (0, typeorm_1.JoinColumn)({ name: 'inviter_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], GroupInvitation.prototype, "inviter", void 0);
exports.GroupInvitation = GroupInvitation = __decorate([
    (0, typeorm_1.Entity)('group_invitation')
], GroupInvitation);
//# sourceMappingURL=group-invitation.entity.js.map