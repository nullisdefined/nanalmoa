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
exports.RespondToInvitationDto = void 0;
const manager_invitation_entity_1 = require("../../../entities/manager-invitation.entity");
const swagger_1 = require("@nestjs/swagger");
class RespondToInvitationDto {
}
exports.RespondToInvitationDto = RespondToInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 ID' }),
    __metadata("design:type", Number)
], RespondToInvitationDto.prototype, "invitationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 ID' }),
    __metadata("design:type", Number)
], RespondToInvitationDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대한 사용자의 UUID' }),
    __metadata("design:type", String)
], RespondToInvitationDto.prototype, "inviterUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대받은 사용자의 UUID' }),
    __metadata("design:type", String)
], RespondToInvitationDto.prototype, "inviteeUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 상태', enum: manager_invitation_entity_1.InvitationStatus }),
    __metadata("design:type", String)
], RespondToInvitationDto.prototype, "status", void 0);
//# sourceMappingURL=response-invitation.dto.js.map