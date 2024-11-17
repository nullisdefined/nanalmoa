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
exports.RemoveGroupMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RemoveGroupMemberDto {
}
exports.RemoveGroupMemberDto = RemoveGroupMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 ID', example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], RemoveGroupMemberDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '제거할 사용자 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RemoveGroupMemberDto.prototype, "memberUuid", void 0);
//# sourceMappingURL=remove-group-member.dto.js.map