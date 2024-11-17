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
exports.ResponseScheduleDto = exports.ResponseGroupInfo = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const category_entity_1 = require("../../../entities/category.entity");
const user_info_detail_dto_1 = require("../../users/dto/user-info-detail.dto");
class ResponseGroupInfo {
}
exports.ResponseGroupInfo = ResponseGroupInfo;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 ID', example: 2 }),
    __metadata("design:type", Number)
], ResponseGroupInfo.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹 이름', example: '개발팀' }),
    __metadata("design:type", String)
], ResponseGroupInfo.prototype, "groupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '그룹에 속한 사용자 정보', type: [user_info_detail_dto_1.UserInfo] }),
    __metadata("design:type", Array)
], ResponseGroupInfo.prototype, "users", void 0);
class ResponseScheduleDto {
    constructor(partial) {
        Object.assign(this, partial);
        this.isGroupSchedule = !!this.groupInfo && this.groupInfo.length > 0;
    }
}
exports.ResponseScheduleDto = ResponseScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '일정 ID', example: 1 }),
    __metadata("design:type", Number)
], ResponseScheduleDto.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '사용자 UUID', example: 'abc123-def456-ghi789' }),
    __metadata("design:type", String)
], ResponseScheduleDto.prototype, "userUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 시작 날짜 및 시간',
        example: '2023-10-15T09:00:00Z',
    }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ResponseScheduleDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 종료 날짜 및 시간',
        example: '2023-10-15T10:00:00Z',
    }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ResponseScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 제목',
        example: '팀 미팅',
    }),
    __metadata("design:type", String)
], ResponseScheduleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 장소',
        example: '회의실 A',
    }),
    __metadata("design:type", String)
], ResponseScheduleDto.prototype, "place", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정에 대한 메모',
        example: '프로젝트 진행 상황 논의',
    }),
    __metadata("design:type", String)
], ResponseScheduleDto.prototype, "memo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '종일 일정 여부',
        example: false,
    }),
    __metadata("design:type", Boolean)
], ResponseScheduleDto.prototype, "isAllDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '일정 카테고리',
        type: () => category_entity_1.Category,
    }),
    __metadata("design:type", category_entity_1.Category)
], ResponseScheduleDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '반복 일정 여부', example: true }),
    __metadata("design:type", Boolean)
], ResponseScheduleDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 유형',
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        example: 'weekly',
    }),
    __metadata("design:type", String)
], ResponseScheduleDto.prototype, "repeatType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 종료 날짜',
        example: '2023-12-31T23:59:59Z',
    }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ResponseScheduleDto.prototype, "repeatEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반복 간격 (일/주/월/년 단위)',
        example: 1,
    }),
    __metadata("design:type", Number)
], ResponseScheduleDto.prototype, "recurringInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '주간 반복 시 반복할 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
        example: [1, 3, 5],
    }),
    __metadata("design:type", Array)
], ResponseScheduleDto.prototype, "recurringDaysOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '월간 반복 시 반복할 날짜',
        example: 15,
    }),
    __metadata("design:type", Number)
], ResponseScheduleDto.prototype, "recurringDayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '연간 반복 시 반복할 월 (1-12)',
        example: 3,
    }),
    __metadata("design:type", Number)
], ResponseScheduleDto.prototype, "recurringMonthOfYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 및 사용자 정보',
        type: [ResponseGroupInfo],
    }),
    __metadata("design:type", Array)
], ResponseScheduleDto.prototype, "groupInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '그룹 일정 여부',
        example: false,
    }),
    __metadata("design:type", Boolean)
], ResponseScheduleDto.prototype, "isGroupSchedule", void 0);
//# sourceMappingURL=response-schedule.dto.js.map