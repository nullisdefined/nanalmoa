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
exports.InvitationsController = void 0;
const common_1 = require("@nestjs/common");
const invitations_service_1 = require("./invitations.service");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const invitations_dto_1 = require("./dto/invitations.dto");
const users_service_1 = require("../users/users.service");
let InvitationsController = class InvitationsController {
    constructor(invitationService, usersService) {
        this.invitationService = invitationService;
        this.usersService = usersService;
    }
    async getUserInvitations(req) {
        const userUuid = req.user['userUuid'];
        const userExists = await this.usersService.checkUserExists(userUuid);
        if (!userExists) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        return this.invitationService.getUserInvitations(userUuid);
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Get)('user'),
    (0, swagger_1.ApiOperation)({
        summary: '사용자 초대 조회',
        description: '본인과 관련된 사용자의 모든 초대를 조회합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대 조회 성공',
        type: [invitations_dto_1.InvitationsDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '사용자를 찾을 수 없음' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "getUserInvitations", null);
exports.InvitationsController = InvitationsController = __decorate([
    (0, swagger_1.ApiTags)('Invitations'),
    (0, common_1.Controller)('invitations'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [invitations_service_1.InvitationsService,
        users_service_1.UsersService])
], InvitationsController);
//# sourceMappingURL=invitations.controller.js.map