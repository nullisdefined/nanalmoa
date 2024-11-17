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
exports.CreateInvitationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateInvitationDto {
}
exports.CreateInvitationDto = CreateInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대하는 사용자의 UUID',
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "managerUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '초대할 사용자의 UUID',
        example: '2b0d7b3d-9bdd-4bad-3b7d-9b1deb4dcb6d',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "subordinateUuid", void 0);
//# sourceMappingURL=create-invitation.dto.js.map