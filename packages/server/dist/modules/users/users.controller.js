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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
const response_schema_1 = require("./schema/response.schema");
const user_entity_1 = require("../../entities/user.entity");
const update_user_dto_1 = require("./dto/update-user.dto");
const auth_service_1 = require("../../auth/auth.service");
const typeorm_1 = require("typeorm");
const auth_entity_1 = require("../../entities/auth.entity");
let UsersController = class UsersController {
    constructor(usersService, authService, dataSource) {
        this.usersService = usersService;
        this.authService = authService;
        this.dataSource = dataSource;
    }
    async getCurrentUser(req) {
        const userUuid = req.user.userUuid;
        return this.usersService.getUserByUuid(userUuid);
    }
    async searchUser(keyword) {
        return this.usersService.searchUser(keyword);
    }
    async updateUserInfo(req, updateUserDto) {
        const userUuid = req.user.userUuid;
        const { name, phoneNumber, email, address } = updateUserDto;
        const currentUser = await this.usersService.getUserByUuid(userUuid);
        if (phoneNumber && phoneNumber !== currentUser.phoneNumber) {
            const isVerified = this.authService.isPhoneNumberVerified(phoneNumber);
            if (!isVerified) {
                throw new common_1.BadRequestException('전화번호 인증이 필요합니다. 먼저 인증을 완료해주세요.');
            }
        }
        if (email && email !== currentUser.email) {
            const isEmailTaken = await this.usersService.isEmailTaken(email, userUuid);
            if (isEmailTaken) {
                throw new common_1.ConflictException('이미 사용 중인 이메일 주소입니다.');
            }
            const isVerified = this.authService.isEmailVerified(email);
            if (!isVerified) {
                throw new common_1.BadRequestException('이메일 인증이 필요합니다. 먼저 인증을 완료해주세요.');
            }
        }
        const updatedUser = await this.usersService.updateUser(userUuid, {
            name,
            phoneNumber,
            email,
            address,
        });
        return {
            message: '회원정보가 성공적으로 수정되었습니다.',
            user: updatedUser,
        };
    }
    async deleteAccount(req) {
        const userUuid = req.user.userUuid;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { userUuid },
                relations: ['auths', 'schedules'],
            });
            if (!user) {
                throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
            }
            for (const auth of user.auths) {
                if (auth.authProvider === auth_entity_1.AuthProvider.KAKAO ||
                    auth.authProvider === auth_entity_1.AuthProvider.NAVER) {
                    await this.authService.revokeSocialConnection(userUuid, auth.refreshToken, auth.authProvider);
                }
            }
            await queryRunner.manager.remove(user.auths);
            await queryRunner.manager.remove(user.schedules);
            await queryRunner.manager.remove(user);
            await queryRunner.commitTransaction();
            return { message: '회원 탈퇴가 성공적으로 처리되었습니다.' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('회원 탈퇴 처리 중 오류:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    (0, swagger_1.ApiOperation)({ summary: '현재 로그인한 사용자 정보 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '현재 사용자 정보 반환',
        schema: response_schema_1.UserResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증되지 않은 사용자' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({
        summary: '사용자 검색',
        description: '전화번호, 이메일, 또는 이름으로 사용자 검색',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['keyword'],
            properties: {
                keyword: {
                    type: 'string',
                    description: '검색 키워드 (전화번호, 이메일, 또는 이름)',
                    example: 'user@example.com',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '검색된 사용자 정보 반환',
        schema: response_schema_1.SearchUserResponseSchema,
        isArray: true,
    }),
    __param(0, (0, common_1.Body)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUser", null);
__decorate([
    (0, common_1.Put)('update'),
    (0, swagger_1.ApiOperation)({ summary: '회원정보 수정' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '회원정보 수정 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 실패' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserInfo", null);
__decorate([
    (0, common_1.Delete)('delete'),
    (0, swagger_1.ApiOperation)({ summary: '회원 탈퇴' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '회원 탈퇴 성공' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 실패' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '사용자를 찾을 수 없음' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: '서버 오류' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService,
        typeorm_1.DataSource])
], UsersController);
//# sourceMappingURL=users.controller.js.map