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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const group_service_1 = require("./group.service");
const invite_group_memeber_dto_1 = require("./dto/invite-group-memeber.dto");
const response_invitation_dto_1 = require("./dto/response-invitation.dto");
const passport_1 = require("@nestjs/passport");
const response_group_dto_1 = require("./dto/response-group.dto");
const response_group_member_dto_1 = require("./dto/response-group-member.dto");
const response_group_detail_dto_1 = require("./dto/response-group-detail.dto");
const response_group_invitation_detail_dto_1 = require("./dto/response-group-invitation-detail.dto");
let GroupController = class GroupController {
    constructor(groupService) {
        this.groupService = groupService;
    }
    async createGroup(groupName, req) {
        const creatorUuid = req.user['userUuid'];
        return this.groupService.createGroup({ groupName, creatorUuid });
    }
    async deleteGroup(groupId, req) {
        const adminUuid = req.user['userUuid'];
        await this.groupService.deleteGroup(groupId, adminUuid);
        return { message: '그룹이 성공적으로 삭제되었습니다.' };
    }
    async getUserGroups(req) {
        const userUuid = req.user['userUuid'];
        return this.groupService.getUserGroups(userUuid);
    }
    async getGroupMembers(groupId, req) {
        const userUuid = req.user['userUuid'];
        return this.groupService.getGroupMembers(groupId, userUuid);
    }
    async inviteGroupMembers(inviteGroupMemberDto, req) {
        const inviterUuid = req.user['userUuid'];
        if (inviteGroupMemberDto.inviteeUuids.includes(inviterUuid)) {
            throw new common_1.ForbiddenException('자신을 초대할 수 없습니다.');
        }
        return this.groupService.inviteGroupMembers(inviteGroupMemberDto, inviterUuid);
    }
    async removeGroupMember(groupId, memberUuid, req) {
        const adminUuid = req.user['userUuid'];
        await this.groupService.removeGroupMember({ groupId, memberUuid }, adminUuid);
        return { message: '멤버가 성공적으로 그룹에서 추방되었습니다.' };
    }
    async acceptInvitation(id, req) {
        const inviteeUuid = req.user['userUuid'];
        return this.groupService.acceptInvitation(id, inviteeUuid);
    }
    async rejectInvitation(id, req) {
        const inviteeUuid = req.user['userUuid'];
        return this.groupService.rejectInvitation(id, inviteeUuid);
    }
    async cancelInvitation(id, req) {
        const inviterUuid = req.user['userUuid'];
        return this.groupService.cancelInvitation(id, inviterUuid);
    }
    async getSentInvitations(req) {
        const userUuid = req.user['userUuid'];
        return this.groupService.getSentInvitations(userUuid);
    }
    async getReceivedInvitations(req) {
        const userUuid = req.user['userUuid'];
        return this.groupService.getReceivedInvitations(userUuid);
    }
    async getGroupInvitationDetail(id) {
        return this.groupService.getGroupInvitationDetail(id);
    }
    async getGroupDetail(groupId, req) {
        const userUuid = req.user['userUuid'];
        return this.groupService.getGroupDetail(groupId, userUuid);
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '새 그룹 생성' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '그룹이 성공적으로 생성됨' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    __param(0, (0, common_1.Query)('groupName')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Delete)(':groupId'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 삭제' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: '삭제할 그룹 ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '그룹이 성공적으로 삭제됨' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '그룹을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, swagger_1.ApiOperation)({ summary: '사용자가 속한 그룹 정보 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '사용자의 그룹 목록',
        type: [response_group_dto_1.GroupInfoResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getUserGroups", null);
__decorate([
    (0, common_1.Get)(':groupId/members'),
    (0, swagger_1.ApiOperation)({ summary: '특정 그룹의 그룹원 정보 조회' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: '그룹 ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '그룹원 목록',
        type: [response_group_member_dto_1.GroupMemberResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '그룹을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupMembers", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 멤버 초대' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '초대가 성공적으로 생성됨' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_group_memeber_dto_1.InviteGroupMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "inviteGroupMembers", null);
__decorate([
    (0, common_1.Delete)(':groupId/members/:memberUuid'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 멤버 추방' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: '그룹 ID' }),
    (0, swagger_1.ApiParam)({ name: 'memberUuid', description: '추방할 멤버의 UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '멤버가 성공적으로 추방됨' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '그룹 또는 멤버를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('memberUuid')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "removeGroupMember", null);
__decorate([
    (0, common_1.Patch)('invitation/:id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 초대 수락' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '초대 ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '초대 수락 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '초대를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Patch)('invitation/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 초대 거절' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '초대 ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '초대 거절 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '초대를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "rejectInvitation", null);
__decorate([
    (0, common_1.Patch)('invitation/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 초대 철회' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '초대 ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '초대 철회 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '초대를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Get)('invitations/sent'),
    (0, swagger_1.ApiOperation)({ summary: '보낸 그룹 초대 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '보낸 초대 목록',
        type: [response_invitation_dto_1.RespondToInvitationDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getSentInvitations", null);
__decorate([
    (0, common_1.Get)('invitations/received'),
    (0, swagger_1.ApiOperation)({ summary: '받은 그룹 초대 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '받은 초대 목록',
        type: [response_invitation_dto_1.RespondToInvitationDto],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getReceivedInvitations", null);
__decorate([
    (0, common_1.Get)('invitation/:id'),
    (0, swagger_1.ApiOperation)({ summary: '그룹 초대 상세 정보 조회' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '초대 ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '그룹 초대 상세 정보',
        type: response_group_invitation_detail_dto_1.GroupInvitationDetailDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '초대를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupInvitationDetail", null);
__decorate([
    (0, common_1.Get)(':groupId'),
    (0, swagger_1.ApiOperation)({ summary: '상세 그룹 정보 조회' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: '조회할 그룹 ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '상세 그룹 정보',
        type: response_group_detail_dto_1.GroupDetailResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '그룹을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupDetail", null);
exports.GroupController = GroupController = __decorate([
    (0, swagger_1.ApiTags)('Group'),
    (0, common_1.Controller)('groups'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('Access-Token'),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map