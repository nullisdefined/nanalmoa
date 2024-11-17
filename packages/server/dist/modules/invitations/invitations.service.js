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
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_invitation_entity_1 = require("../../entities/group-invitation.entity");
const manager_invitation_entity_1 = require("../../entities/manager-invitation.entity");
const invitations_dto_1 = require("./dto/invitations.dto");
const users_service_1 = require("../users/users.service");
let InvitationsService = class InvitationsService {
    constructor(groupInvitationRepository, managerInvitationRepository, usersService) {
        this.groupInvitationRepository = groupInvitationRepository;
        this.managerInvitationRepository = managerInvitationRepository;
        this.usersService = usersService;
    }
    async getUserInvitations(userUuid) {
        const userExists = await this.usersService.checkUserExists(userUuid);
        if (!userExists) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        const groupInvitations = await this.groupInvitationRepository.find({
            where: [
                { inviterUuid: userUuid, status: (0, typeorm_2.Not)(manager_invitation_entity_1.InvitationStatus.REMOVED) },
                { inviteeUuid: userUuid, status: (0, typeorm_2.Not)(manager_invitation_entity_1.InvitationStatus.REMOVED) },
            ],
            relations: ['group'],
        });
        const managerInvitations = await this.managerInvitationRepository.find({
            where: [
                { managerUuid: userUuid, status: (0, typeorm_2.Not)(manager_invitation_entity_1.InvitationStatus.REMOVED) },
                { subordinateUuid: userUuid, status: (0, typeorm_2.Not)(manager_invitation_entity_1.InvitationStatus.REMOVED) },
            ],
        });
        const combinedInvitations = await Promise.all([
            ...groupInvitations.map(async (inv) => {
                const inviter = await this.usersService.findOne(inv.inviterUuid);
                const invitee = await this.usersService.findOne(inv.inviteeUuid);
                return {
                    id: inv.groupInvitationId,
                    type: invitations_dto_1.InvitationsType.GROUP,
                    role: inv.inviterUuid === userUuid
                        ? invitations_dto_1.InvitationsRole.GROUP_ADMIN
                        : invitations_dto_1.InvitationsRole.GROUP_MEMBER,
                    status: inv.status,
                    createdAt: inv.createdAt,
                    updatedAt: inv.updatedAt,
                    inviterUuid: inv.inviterUuid,
                    inviterName: inviter.name,
                    inviteeUuid: inv.inviteeUuid,
                    inviteeName: invitee.name,
                    groupId: inv.group.groupId,
                    groupName: inv.group.groupName,
                };
            }),
            ...managerInvitations.map(async (inv) => {
                const manager = await this.usersService.findOne(inv.managerUuid);
                const subordinate = await this.usersService.findOne(inv.subordinateUuid);
                return {
                    id: inv.managerInvitationId,
                    type: invitations_dto_1.InvitationsType.MANAGER,
                    role: inv.managerUuid === userUuid
                        ? invitations_dto_1.InvitationsRole.MANAGER
                        : invitations_dto_1.InvitationsRole.SUBORDINATE,
                    status: inv.status,
                    createdAt: inv.createdAt,
                    updatedAt: inv.updatedAt,
                    inviterUuid: inv.managerUuid,
                    inviterName: manager.name,
                    inviteeUuid: inv.subordinateUuid,
                    inviteeName: subordinate.name,
                };
            }),
        ]);
        combinedInvitations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        return combinedInvitations;
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_invitation_entity_1.GroupInvitation)),
    __param(1, (0, typeorm_1.InjectRepository)(manager_invitation_entity_1.ManagerInvitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map