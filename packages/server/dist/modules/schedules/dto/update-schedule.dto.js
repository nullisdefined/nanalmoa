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
exports.UpdateScheduleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_schedule_dto_1 = require("./create-schedule.dto");
class UpdateScheduleDto {
}
exports.UpdateScheduleDto = UpdateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 시작 날짜 및 시간',
        example: '2024-10-15T00:00:00Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateScheduleDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 종료 날짜 및 시간',
        example: '2024-10-15T01:00:00Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 제목',
        example: '팀 미팅',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 장소',
        example: '회의실 A',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "place", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정에 대한 메모',
        example: '프로젝트 진행 상황 논의',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "memo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '종일 일정 여부',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateScheduleDto.prototype, "isAllDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 카테고리 ID',
        example: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateScheduleDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 일정 여부',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateScheduleDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 유형',
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        example: 'weekly',
        required: false,
    }),
    (0, class_validator_1.IsEnum)(['none', 'daily', 'weekly', 'monthly', 'yearly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "repeatType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 종료 날짜',
        example: '2024-11-02T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.isRecurring === true),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateScheduleDto.prototype, "repeatEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 간격 (일/주/월/년 단위)',
        example: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateScheduleDto.prototype, "recurringInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '주간 반복 시 반복할 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
        example: [2, 4],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateScheduleDto.prototype, "recurringDaysOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '월간 반복 시 반복할 날짜',
        example: 15,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateScheduleDto.prototype, "recurringDayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '연간 반복 시 반복할 월 (1-12)',
        example: 3,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateScheduleDto.prototype, "recurringMonthOfYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '추가할 그룹 정보',
        type: [create_schedule_dto_1.GroupInfo],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_schedule_dto_1.GroupInfo),
    __metadata("design:type", Array)
], UpdateScheduleDto.prototype, "addGroupInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '삭제할 그룹 정보',
        type: [create_schedule_dto_1.GroupInfo],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_schedule_dto_1.GroupInfo),
    __metadata("design:type", Array)
], UpdateScheduleDto.prototype, "deleteGroupInfo", void 0);
//# sourceMappingURL=update-schedule.dto.js.map