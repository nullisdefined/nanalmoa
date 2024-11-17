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
exports.UserInfo = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserInfo {
}
exports.UserInfo = UserInfo;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 UUID',
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    }),
    __metadata("design:type", String)
], UserInfo.prototype, "userUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '사용자 이름', example: '홍길동' }),
    __metadata("design:type", String)
], UserInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '사용자 이메일', example: 'user@example.com' }),
    __metadata("design:type", String)
], UserInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '사용자 전화번호', example: '010-1234-5678' }),
    __metadata("design:type", String)
], UserInfo.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 프로필 이미지 URL',
        example: 'https://example.com/profile.jpg',
    }),
    __metadata("design:type", String)
], UserInfo.prototype, "profileImage", void 0);
//# sourceMappingURL=user-info-detail.dto.js.map