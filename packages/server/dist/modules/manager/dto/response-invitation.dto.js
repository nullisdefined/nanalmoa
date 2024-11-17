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
exports.InvitationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const manager_invitation_entity_1 = require("../../../entities/manager-invitation.entity");
class InvitationResponseDto {
}
exports.InvitationResponseDto = InvitationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 ID' }),
    __metadata("design:type", Number)
], InvitationResponseDto.prototype, "managerInvitationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대자 UUID' }),
    __metadata("design:type", String)
], InvitationResponseDto.prototype, "managerUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대자 이름', example: '홍길동' }),
    __metadata("design:type", String)
], InvitationResponseDto.prototype, "managerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대받은 사용자 UUID' }),
    __metadata("design:type", String)
], InvitationResponseDto.prototype, "subordinateUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 받은 사용자 이름', example: '김철수' }),
    __metadata("design:type", String)
], InvitationResponseDto.prototype, "subordinateName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: manager_invitation_entity_1.InvitationStatus, description: '초대 상태' }),
    __metadata("design:type", String)
], InvitationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 생성 일시' }),
    __metadata("design:type", Date)
], InvitationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대 상태 최종 업데이트 일시' }),
    __metadata("design:type", Date)
], InvitationResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=response-invitation.dto.js.map