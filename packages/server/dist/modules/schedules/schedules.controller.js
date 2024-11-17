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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const schedules_service_1 = require("./schedules.service");
const response_schedule_dto_1 = require("./dto/response-schedule.dto");
const platform_express_1 = require("@nestjs/platform-express");
const voice_schedule_upload_dto_1 = require("./dto/voice-schedule-upload.dto");
const ocr_schedule_upload_dto_1 = require("./dto/ocr-schedule-upload.dto");
const OCR_transcription_service_1 = require("./OCR-transcription.service");
const passport_1 = require("@nestjs/passport");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const manager_service_1 = require("../manager/manager.service");
let SchedulesController = class SchedulesController {
    constructor(schedulesService, ocrTranscriptionService, managerService) {
        this.schedulesService = schedulesService;
        this.ocrTranscriptionService = ocrTranscriptionService;
        this.managerService = managerService;
    }
    async getSchedulesByDate(req, date, queryUserUuid) {
        const managerUuid = req.user.userUuid;
        const subordinateUuid = queryUserUuid || managerUuid;
        if (subordinateUuid !== managerUuid) {
            const isManager = await this.managerService.validateAndCheckManagerRelation(managerUuid, subordinateUuid);
            if (!isManager) {
                throw new common_1.ForbiddenException('해당 사용자의 일정을 조회할 권한이 없습니다.');
            }
        }
        return this.schedulesService.findByDate({
            userUuid: subordinateUuid,
            date: new Date(date),
        });
    }
    async getSchedulesByWeek(req, queryUserUuid, date) {
        const managerUuid = req.user.userUuid;
        const subordinateUuid = queryUserUuid || managerUuid;
        if (subordinateUuid !== managerUuid) {
            const isManager = await this.managerService.validateAndCheckManagerRelation(managerUuid, subordinateUuid);
            if (!isManager) {
                throw new common_1.ForbiddenException('해당 사용자의 일정을 조회할 권한이 없습니다.');
            }
        }
        return this.schedulesService.findByWeek(subordinateUuid, date);
    }
    async getSchedulesByMonth(req, queryUserUuid, year, month) {
        const managerUuid = req.user.userUuid;
        const subordinateUuid = queryUserUuid || managerUuid;
        if (subordinateUuid !== managerUuid) {
            const isManager = await this.managerService.validateAndCheckManagerRelation(managerUuid, subordinateUuid);
            if (!isManager) {
                throw new common_1.ForbiddenException('해당 사용자의 일정을 조회할 권한이 없습니다.');
            }
        }
        return this.schedulesService.findByMonth(subordinateUuid, year, month);
    }
    async getSchedulesByYear(req, queryUserUuid, year) {
        const userUuid = queryUserUuid || req.user.userUuid;
        return this.schedulesService.findByYear(userUuid, year);
    }
    async getSchedulesByDateRange(req, queryUserUuid, startDate, endDate) {
        const managerUuid = req.user.userUuid;
        const subordinateUuid = queryUserUuid || managerUuid;
        if (subordinateUuid !== managerUuid) {
            const isManager = await this.managerService.validateAndCheckManagerRelation(managerUuid, subordinateUuid);
            if (!isManager) {
                throw new common_1.ForbiddenException('해당 사용자의 일정을 조회할 권한이 없습니다.');
            }
        }
        return this.schedulesService.getSchedulesInRange(subordinateUuid, new Date(startDate), new Date(endDate));
    }
    async getAllSchedulesByUserUuid(req) {
        const userUuid = req.user.userUuid;
        return this.schedulesService.findAllByUserUuid(userUuid);
    }
    async getScheduleById(id) {
        return await this.schedulesService.findOne(id);
    }
    async createSchedule(req, createScheduleDto) {
        const userUuid = req.user.userUuid;
        return await this.schedulesService.createSchedule(userUuid, createScheduleDto);
    }
    async updateSchedule(req, id, updateScheduleDto, instanceDate, updateType = 'single') {
        const userUuid = req.user.userUuid;
        return await this.schedulesService.updateSchedule(userUuid, id, updateScheduleDto, new Date(instanceDate), updateType);
    }
    async deleteSchedule(req, id, queryUserUuid, instanceDate, deleteType = 'single') {
        const userUuid = queryUserUuid || req.user.userUuid;
        await this.schedulesService.deleteSchedule(userUuid, id, instanceDate, deleteType);
        return { message: '일정이 성공적으로 삭제되었습니다.' };
    }
    async uploadVoiceScheduleByRTZR(req, file, currentDateTime) {
        const userUuid = req.user.userUuid;
        return await this.schedulesService.transcribeRTZRAndFetchResultWithGpt(file, currentDateTime, userUuid);
    }
    async uploadVoiceScheduleByWhisper(req, file, currentDateTime) {
        const userUuid = req.user.userUuid;
        return await this.schedulesService.transcribeWhisperAndFetchResultWithGpt(file, currentDateTime, userUuid);
    }
    async uploadImageScheduleClova(file, req) {
        const userUuid = req.user.userUuid;
        return await this.ocrTranscriptionService.processMedicationImage(file, userUuid);
    }
};
exports.SchedulesController = SchedulesController;
__decorate([
    (0, common_1.Get)('day'),
    (0, swagger_1.ApiOperation)({ summary: '특정 일의 일정 조회' }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '사용자의 UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: true,
        type: String,
        description: '조회할 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '유효하지 않은 날짜 형식입니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('userUuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByDate", null);
__decorate([
    (0, common_1.Get)('week'),
    (0, swagger_1.ApiOperation)({ summary: '특정 주의 일정 조회' }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '사용자의 UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: true,
        type: String,
        description: '조회할 주 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '유효하지 않은 날짜 형식입니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userUuid')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByWeek", null);
__decorate([
    (0, common_1.Get)('month'),
    (0, swagger_1.ApiOperation)({ summary: '특정 월의 일정 조회' }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '사용자의 UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'year',
        required: true,
        type: Number,
        description: '조회할 연도',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'month',
        required: true,
        type: Number,
        description: '조회할 월 (1-12)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '유효하지 않은 연도 또는 월입니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userUuid')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByMonth", null);
__decorate([
    (0, common_1.Get)('year'),
    (0, swagger_1.ApiOperation)({ summary: '특정 연도의 일정 조회' }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '사용자의 UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'year',
        required: true,
        type: Number,
        description: '조회할 연도',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '유효하지 않은 연도입니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userUuid')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByYear", null);
__decorate([
    (0, common_1.Get)('range'),
    (0, swagger_1.ApiOperation)({ summary: '특정 날짜 범위의 일정 조회' }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '피관리자의 UUID (없으면 본인의 일정 조회)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: true,
        type: String,
        description: '시작 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: true,
        type: String,
        description: '종료 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userUuid')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByDateRange", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({
        summary: '사용자의 모든 일정 조회',
        description: '사용자의 반복 일정을 포함한 전후 1년의 일정을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: [response_schedule_dto_1.ResponseScheduleDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getAllSchedulesByUserUuid", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '일정 ID로 조회',
        description: '지정된 ID로 일정을 조회합니다. 반복 일정의 경우 첫 일정만 조회됩니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 조회 성공',
        type: response_schedule_dto_1.ResponseScheduleDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '일정을 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '해당 ID의 일정을 찾을 수 없습니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getScheduleById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '새 일정 생성 (일반 및 반복)',
        description: '새로운 일정을 생성합니다. 반복 일정도 이 API를 사용합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '일정이 성공적으로 생성됨',
        type: response_schedule_dto_1.ResponseScheduleDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '일정 수정',
        description: '기존 일정을 수정합니다. 단일 일정 또는 이후 모든 일정을 수정할 수 있습니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        required: true,
        type: Number,
        description: '수정할 일정의 ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'instanceDate',
        required: true,
        type: String,
        description: '수정할 인스턴스의 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'updateType',
        required: false,
        type: String,
        enum: ['single', 'future'],
        description: '수정 유형 (단일 또는 이후 모든 일정)',
    }),
    (0, swagger_1.ApiBody)({ type: update_schedule_dto_1.UpdateScheduleDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정이 성공적으로 수정됨',
        type: response_schedule_dto_1.ResponseScheduleDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('instanceDate')),
    __param(4, (0, common_1.Query)('updateType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_schedule_dto_1.UpdateScheduleDto, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '일정 삭제' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        required: true,
        type: Number,
        description: '삭제할 일정의 ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userUuid',
        required: false,
        type: String,
        description: '사용자의 UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'instanceDate',
        required: true,
        type: String,
        description: '삭제할 인스턴스의 날짜 (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'deleteType',
        required: false,
        type: String,
        enum: ['single', 'future'],
        description: '삭제 유형 (단일 또는 이후 모든 일정)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '일정 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '일정이 성공적으로 삭제되었습니다.',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '유효하지 않은 요청입니다.',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '일정을 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '해당 일정을 찾을 수 없습니다.',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('userUuid')),
    __param(3, (0, common_1.Query)('instanceDate')),
    __param(4, (0, common_1.Query)('deleteType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Post)('upload/RTZR'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    (0, swagger_1.ApiOperation)({ summary: '음성 파일 업로드 및 일정 추출' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: voice_schedule_upload_dto_1.VoiceScheduleUploadDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '추출된 일정 정보',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('currentDateTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "uploadVoiceScheduleByRTZR", null);
__decorate([
    (0, common_1.Post)('upload/Whisper'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    (0, swagger_1.ApiOperation)({ summary: '음성 파일 업로드 및 일정 추출' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: voice_schedule_upload_dto_1.VoiceScheduleUploadDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '추출된 일정 정보',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('currentDateTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "uploadVoiceScheduleByWhisper", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, swagger_1.ApiOperation)({ summary: '이미지 파일 업로드 및 일정 추출' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: ocr_schedule_upload_dto_1.OCRScheduleUploadDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '추출된 일정 정보',
        type: [create_schedule_dto_1.CreateScheduleDto],
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "uploadImageScheduleClova", null);
exports.SchedulesController = SchedulesController = __decorate([
    (0, swagger_1.ApiTags)('Schedules'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('schedules'),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [schedules_service_1.SchedulesService,
        OCR_transcription_service_1.OCRTranscriptionService,
        manager_service_1.ManagerService])
], SchedulesController);
//# sourceMappingURL=schedules.controller.js.map