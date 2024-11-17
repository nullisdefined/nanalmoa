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
exports.InvitationsDto = exports.InvitationsRole = exports.InvitationsType = void 0;
const swagger_1 = require("@nestjs/swagger");
var InvitationsType;
(function (InvitationsType) {
    InvitationsType["GROUP"] = "group";
    InvitationsType["MANAGER"] = "manager";
})(InvitationsType || (exports.InvitationsType = InvitationsType = {}));
var InvitationsRole;
(function (InvitationsRole) {
    InvitationsRole["MANAGER"] = "MANAGER";
    InvitationsRole["SUBORDINATE"] = "SUBORDINATE";
    InvitationsRole["GROUP_ADMIN"] = "GROUP_ADMIN";
    InvitationsRole["GROUP_MEMBER"] = "GROUP_MEMBER";
})(InvitationsRole || (exports.InvitationsRole = InvitationsRole = {}));
class InvitationsDto {
}
exports.InvitationsDto = InvitationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '초대의 고유 식별자', example: 1 }),
    __metadata("design:type", Number)
], InvitationsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: InvitationsType,
        description: '초대 유형 (그룹 또는 관리자)',
        example: InvitationsType.GROUP,
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: InvitationsRole,
        description: '이 초대에서 사용자의 역할',
        example: InvitationsRole.GROUP_ADMIN,
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대의 현재 상태',
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대 생성 일시',
        example: '2023-05-20T09:00:00Z',
    }),
    __metadata("design:type", Date)
], InvitationsDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대 마지막 업데이트 일시',
        example: '2023-05-20T09:00:00Z',
    }),
    __metadata("design:type", Date)
], InvitationsDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대자의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "inviterUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대자의 이름',
        example: '홍길동',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "inviterName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대받은 사람의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "inviteeUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대받은 사람의 이름',
        example: '김철수',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "inviteeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '관련 그룹의 ID',
        required: false,
        example: 1,
    }),
    __metadata("design:type", Number)
], InvitationsDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '관련 그룹의 이름',
        required: false,
        example: '우리 동네 모임',
    }),
    __metadata("design:type", String)
], InvitationsDto.prototype, "groupName", void 0);
//# sourceMappingURL=invitations.dto.js.map