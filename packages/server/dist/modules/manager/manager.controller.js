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
exports.ManagerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const manager_service_1 = require("./manager.service");
const manager_invitation_entity_1 = require("../../entities/manager-invitation.entity");
const user_response_dto_1 = require("../users/dto/user-response.dto");
const passport_1 = require("@nestjs/passport");
const response_invitation_dto_1 = require("./dto/response-invitation.dto");
let ManagerController = class ManagerController {
    constructor(managerService) {
        this.managerService = managerService;
    }
    async createInvitation(subordinateUuid, req) {
        const managerUuid = req.user['userUuid'];
        return this.managerService.createInvitation({
            managerUuid,
            subordinateUuid,
        });
    }
    async getInvitationSend(req) {
        const managerUuid = req.user['userUuid'];
        return this.managerService.getInvitationSend({ managerUuid });
    }
    async getInvitationReceived(req) {
        const subordinateUuid = req.user['userUuid'];
        return this.managerService.getInvitationReceived({ subordinateUuid });
    }
    async getInvitationUsers(managerUuid, subordinateUuid) {
        return this.managerService.getInvitationUsers({
            managerUuid,
            subordinateUuid,
        });
    }
    async getInvitation(id) {
        return this.managerService.getInvitation(id);
    }
    async acceptInvitation(id, req) {
        const subordinateUuid = req.user['userUuid'];
        return this.managerService.acceptInvitation(id, subordinateUuid);
    }
    async rejectInvitation(id, req) {
        const subordinateUuid = req.user['userUuid'];
        return this.managerService.rejectInvitation(id, subordinateUuid);
    }
    async cancelInvitation(id, req) {
        const managerUuid = req.user['userUuid'];
        return this.managerService.cancelInvitation(id, managerUuid);
    }
    async removeSubordinate(subordinateUuid, req) {
        const managerUuid = req.user['userUuid'];
        return this.managerService.removeManagerSubordinate(managerUuid, subordinateUuid);
    }
    async removeManager(managerUuid, req) {
        const subordinateUuid = req.user['userUuid'];
        return this.managerService.removeManagerSubordinate(managerUuid, subordinateUuid);
    }
    async getManagerList(req) {
        const subordinateUuid = req.user['userUuid'];
        return this.managerService.getManagerList(subordinateUuid);
    }
    async getSubordinateList(req) {
        const managerUuid = req.user['userUuid'];
        return this.managerService.getSubordinateList(managerUuid);
    }
};
exports.ManagerController = ManagerController;
__decorate([
    (0, common_1.Post)('invitation'),
    (0, swagger_1.ApiOperation)({ summary: '새로운 관리자 초대 생성' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '초대가 성공적으로 생성됨',
        type: response_invitation_dto_1.InvitationResponseDto,
    }),
    __param(0, (0, common_1.Query)('subordinateUuid')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Get)('invitation/send'),
    (0, swagger_1.ApiOperation)({ summary: '내가 보낸 초대 현황' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대 보낸 정보 조회 성공',
        type: [response_invitation_dto_1.InvitationResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getInvitationSend", null);
__decorate([
    (0, common_1.Get)('invitation/received'),
    (0, swagger_1.ApiOperation)({ summary: '내가 받은 초대 현황' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대 받은 정보 조회 성공',
        type: [response_invitation_dto_1.InvitationResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getInvitationReceived", null);
__decorate([
    (0, common_1.Get)('invitation/user'),
    (0, swagger_1.ApiOperation)({ summary: '보낸 유저와 받은 유저 초대 현황(삭제 예정)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '두 유저의 초대 상태',
        type: response_invitation_dto_1.InvitationResponseDto,
    }),
    __param(0, (0, common_1.Query)('managerUuid')),
    __param(1, (0, common_1.Query)('subordinateUuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getInvitationUsers", null);
__decorate([
    (0, common_1.Get)('invitation/:id'),
    (0, swagger_1.ApiOperation)({ summary: '초대 정보 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대 정보 조회 성공',
        type: response_invitation_dto_1.InvitationResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getInvitation", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '초대 수락' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대가 성공적으로 수락됨',
        type: manager_invitation_entity_1.ManagerInvitation,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: '초대 거절' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대가 성공적으로 거절됨',
        type: response_invitation_dto_1.InvitationResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "rejectInvitation", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '초대 철회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '초대가 성공적으로 철회됨',
        type: manager_invitation_entity_1.ManagerInvitation,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Delete)('subordinate/:subordinateUuid'),
    (0, swagger_1.ApiOperation)({ summary: '내가 관리자일 때, 관리자-피관리자 관계 제거' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '관리자-피관리자 관계가 성공적으로 제거됨',
    }),
    __param(0, (0, common_1.Param)('subordinateUuid')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "removeSubordinate", null);
__decorate([
    (0, common_1.Delete)('manager/:managerUuid'),
    (0, swagger_1.ApiOperation)({ summary: '내가 피관리자일 때, 관리자-피관리자 관계 제거' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '관리자-피관리자 관계가 성공적으로 제거됨',
    }),
    __param(0, (0, common_1.Param)('managerUuid')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "removeManager", null);
__decorate([
    (0, common_1.Get)('managers'),
    (0, swagger_1.ApiOperation)({ summary: '자신의 관리자 목록 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '관리자 목록 조회 성공',
        type: [user_response_dto_1.UserResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getManagerList", null);
__decorate([
    (0, common_1.Get)('subordinates'),
    (0, swagger_1.ApiOperation)({ summary: '자신의 피관리자 목록 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '피관리자 목록 조회 성공',
        type: [user_response_dto_1.UserResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerController.prototype, "getSubordinateList", null);
exports.ManagerController = ManagerController = __decorate([
    (0, swagger_1.ApiTags)('Manager'),
    (0, common_1.Controller)('manager'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [manager_service_1.ManagerService])
], ManagerController);
//# sourceMappingURL=manager.controller.js.map