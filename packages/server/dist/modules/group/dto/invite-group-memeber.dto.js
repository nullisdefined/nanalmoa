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
exports.InviteGroupMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InviteGroupMemberDto {
}
exports.InviteGroupMemberDto = InviteGroupMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InviteGroupMemberDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대받는 사용자들의 UUID 리스트',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '223e4567-e89b-12d3-a456-426614174001',
        ],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], InviteGroupMemberDto.prototype, "inviteeUuids", void 0);
//# sourceMappingURL=invite-group-memeber.dto.js.map