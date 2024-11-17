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
exports.CreateScheduleDto = exports.GroupInfo = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class GroupInfo {
}
exports.GroupInfo = GroupInfo;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], GroupInfo.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹에 속한 사용자 UUID 배열',
        example: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], GroupInfo.prototype, "userUuids", void 0);
class CreateScheduleDto {
    constructor() {
        this.title = '새로운 일정';
        this.place = '';
        this.memo = '';
        this.isAllDay = false;
        this.categoryId = 7;
        this.isRecurring = false;
        this.repeatEndDate = null;
        this.recurringDaysOfWeek = null;
        this.recurringDayOfMonth = null;
        this.recurringMonthOfYear = null;
    }
}
exports.CreateScheduleDto = CreateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 시작 날짜 및 시간',
        example: '2024-10-15T00:00:00Z',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateScheduleDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 종료 날짜 및 시간',
        example: '2024-10-15T01:00:00Z',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 제목',
        example: '팀 미팅',
        default: '새로운 일정',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 장소',
        example: '회의실 A',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "place", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정에 대한 메모',
        example: '프로젝트 진행 상황 논의',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "memo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '종일 일정 여부',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateScheduleDto.prototype, "isAllDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 카테고리 ID',
        example: 1,
        default: 7,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '반복 일정 여부', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateScheduleDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 유형',
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        example: 'weekly',
    }),
    (0, class_validator_1.IsEnum)(['none', 'daily', 'weekly', 'monthly', 'yearly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "repeatType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 종료 날짜',
        example: '2024-11-02T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.isRecurring === true),
    (0, class_validator_1.IsNotEmpty)({ message: '반복 일정의 경우 반복 종료 날짜는 필수입니다.' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateScheduleDto.prototype, "repeatEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 간격 (일/주/월/년 단위)',
        example: 1,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "recurringInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '주간 반복 시 반복할 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
        example: [2, 4],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateScheduleDto.prototype, "recurringDaysOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '월간 반복 시 반복할 날짜',
        example: null,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "recurringDayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '연간 반복 시 반복할 월 (1-12)',
        example: null,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "recurringMonthOfYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 정보 배열',
        type: [GroupInfo],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GroupInfo),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateScheduleDto.prototype, "groupInfo", void 0);
//# sourceMappingURL=create-schedule.dto.js.map