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
exports.GroupMemberResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GroupMemberResponseDto {
}
exports.GroupMemberResponseDto = GroupMemberResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], GroupMemberResponseDto.prototype, "userUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 이름',
        example: '홍길동',
    }),
    __metadata("design:type", String)
], GroupMemberResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '관리자 여부', example: false }),
    __metadata("design:type", Boolean)
], GroupMemberResponseDto.prototype, "isAdmin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 가입 날짜',
        example: '2023-05-20T09:00:00Z',
    }),
    __metadata("design:type", Date)
], GroupMemberResponseDto.prototype, "joinedAt", void 0);
//# sourceMappingURL=response-group-member.dto.js.map