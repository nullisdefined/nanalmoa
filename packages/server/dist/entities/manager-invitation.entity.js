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
exports.ManagerInvitation = exports.InvitationStatus = void 0;
const typeorm_1 = require("typeorm");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["REJECTED"] = "REJECTED";
    InvitationStatus["CANCELED"] = "CANCELED";
    InvitationStatus["REMOVED"] = "REMOVED";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
let ManagerInvitation = class ManagerInvitation {
};
exports.ManagerInvitation = ManagerInvitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'manager_invitation_id' }),
    __metadata("design:type", Number)
], ManagerInvitation.prototype, "managerInvitationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_uuid', type: 'varchar' }),
    __metadata("design:type", String)
], ManagerInvitation.prototype, "managerUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subordinate_uuid', type: 'varchar' }),
    __metadata("design:type", String)
], ManagerInvitation.prototype, "subordinateUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], ManagerInvitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ManagerInvitation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ManagerInvitation.prototype, "updatedAt", void 0);
exports.ManagerInvitation = ManagerInvitation = __decorate([
    (0, typeorm_1.Entity)('manager_invitation')
], ManagerInvitation);
//# sourceMappingURL=manager-invitation.entity.js.map