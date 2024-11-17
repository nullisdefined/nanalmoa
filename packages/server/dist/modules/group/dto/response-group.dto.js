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
exports.GroupInfoResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GroupInfoResponseDto {
}
exports.GroupInfoResponseDto = GroupInfoResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 ID', example: 1 }),
    __metadata("design:type", Number)
], GroupInfoResponseDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 이름', example: '우리 동네 모임' }),
    __metadata("design:type", String)
], GroupInfoResponseDto.prototype, "groupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 생성 날짜',
        example: '2023-05-20T09:00:00Z',
    }),
    __metadata("design:type", Date)
], GroupInfoResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹원 수', example: 5 }),
    __metadata("design:type", Number)
], GroupInfoResponseDto.prototype, "memberCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '관리자 여부', example: true }),
    __metadata("design:type", Boolean)
], GroupInfoResponseDto.prototype, "isAdmin", void 0);
//# sourceMappingURL=response-group.dto.js.map