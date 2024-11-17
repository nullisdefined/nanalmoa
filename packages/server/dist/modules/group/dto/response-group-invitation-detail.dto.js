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
exports.GroupInvitationDetailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const manager_invitation_entity_1 = require("../../../entities/manager-invitation.entity");
class GroupInvitationDetailDto {
}
exports.GroupInvitationDetailDto = GroupInvitationDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대한 사용자의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "inviterUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대한 사용자의 이름',
        example: '홍길동',
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "inviterName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대받은 사용자의 UUID',
        example: '223e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "inviteeUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대받은 사용자의 이름',
        example: '김철수',
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "inviteeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 이름',
        example: '우리 동네 모임',
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "groupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 ID',
        example: 1,
    }),
    __metadata("design:type", Number)
], GroupInvitationDetailDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대 상태',
        enum: manager_invitation_entity_1.InvitationStatus,
        example: manager_invitation_entity_1.InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], GroupInvitationDetailDto.prototype, "status", void 0);
//# sourceMappingURL=response-group-invitation-detail.dto.js.map