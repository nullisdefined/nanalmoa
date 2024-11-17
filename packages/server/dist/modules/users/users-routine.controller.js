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
exports.UsersRoutineController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_routine_service_1 = require("./users-routine.service");
const response_user_routine_dto_1 = require("./dto/response-user-routine.dto");
const update_user_routine_dto_1 = require("./dto/update-user-routine.dto");
const passport_1 = require("@nestjs/passport");
let UsersRoutineController = class UsersRoutineController {
    constructor(usersRoutineService) {
        this.usersRoutineService = usersRoutineService;
    }
    async updateUserRoutine(req, updateDto) {
        const userUuid = req.user['userUuid'];
        if (!userUuid) {
            throw new common_1.BadRequestException('사용자 UUID가 필요합니다.');
        }
        try {
            return await this.usersRoutineService.updateUserRoutine(userUuid, updateDto);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error instanceof Error &&
                error.message === '시간 순서가 올바르지 않습니다.') {
                throw new common_1.BadRequestException(error.message);
            }
            throw new common_1.BadRequestException('잘못된 요청입니다.');
        }
    }
    async getUserRoutine(req) {
        const userUuid = req.user['userUuid'];
        if (!userUuid) {
            throw new common_1.BadRequestException('사용자 UUID가 필요합니다.');
        }
        try {
            return await this.usersRoutineService.getUserRoutine(userUuid);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('잘못된 요청입니다.');
        }
    }
};
exports.UsersRoutineController = UsersRoutineController;
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: '유저 루틴 정보 업데이트' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '성공',
        type: response_user_routine_dto_1.UserRoutineResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '잘못된 요청 (유효하지 않은 UUID, 잘못된 시간 순서)',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: '인증되지 않은 사용자' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_routine_dto_1.UpdateUserRoutineDto]),
    __metadata("design:returntype", Promise)
], UsersRoutineController.prototype, "updateUserRoutine", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '유저 루틴 정보 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '성공',
        type: response_user_routine_dto_1.UserRoutineResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '잘못된 요청 (예: 유효하지 않은 UUID)',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: '인증되지 않은 사용자' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersRoutineController.prototype, "getUserRoutine", null);
exports.UsersRoutineController = UsersRoutineController = __decorate([
    (0, swagger_1.ApiTags)('Users-Routine'),
    (0, common_1.Controller)('users-routine'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [users_routine_service_1.UsersRoutineService])
], UsersRoutineController);
//# sourceMappingURL=users-routine.controller.js.map