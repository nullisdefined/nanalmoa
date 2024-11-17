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
exports.UpdateUserRoutineDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateUserRoutineDto {
}
exports.UpdateUserRoutineDto = UpdateUserRoutineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '07:00', description: '기상 시간 (HH:mm 형식)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: '올바른 시간 형식이 아닙니다 (HH:mm)',
    }),
    __metadata("design:type", String)
], UpdateUserRoutineDto.prototype, "wakeUpTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08:00', description: '아침 식사 시간 (HH:mm 형식)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: '올바른 시간 형식이 아닙니다 (HH:mm)',
    }),
    __metadata("design:type", String)
], UpdateUserRoutineDto.prototype, "breakfastTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12:00', description: '점심 식사 시간 (HH:mm 형식)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: '올바른 시간 형식이 아닙니다 (HH:mm)',
    }),
    __metadata("design:type", String)
], UpdateUserRoutineDto.prototype, "lunchTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00', description: '저녁 식사 시간 (HH:mm 형식)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: '올바른 시간 형식이 아닙니다 (HH:mm)',
    }),
    __metadata("design:type", String)
], UpdateUserRoutineDto.prototype, "dinnerTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22:00', description: '취침 시간 (HH:mm 형식)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: '올바른 시간 형식이 아닙니다 (HH:mm)',
    }),
    __metadata("design:type", String)
], UpdateUserRoutineDto.prototype, "bedTime", void 0);
//# sourceMappingURL=update-user-routine.dto.js.map