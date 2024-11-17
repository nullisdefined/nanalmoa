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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_entity_1 = require("../../entities/group.entity");
const user_group_entity_1 = require("../../entities/user-group.entity");
const group_invitation_entity_1 = require("../../entities/group-invitation.entity");
const manager_invitation_entity_1 = require("../../entities/manager-invitation.entity");
const users_service_1 = require("../users/users.service");
const group_schedule_entity_1 = require("../../entities/group-schedule.entity");
const user_entity_1 = require("../../entities/user.entity");
let GroupService = class GroupService {
    constructor(groupRepository, userGroupRepository, groupInvitationRepository, userRepository, dataSource, usersService, groupScheduleRepository) {
        this.groupRepository = groupRepository;
        this.userGroupRepository = userGroupRepository;
        this.groupInvitationRepository = groupInvitationRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.usersService = usersService;
        this.groupScheduleRepository = groupScheduleRepository;
    }
    async createGroup(createGroupDto) {
        const { groupName, creatorUuid } = createGroupDto;
        const existingGroup = await this.userGroupRepository.findOne({
            where: { userUuid: creatorUuid },
            relations: ['group'],
        });
        if (existingGroup && existingGroup.group.groupName === groupName) {
            throw new common_1.BadRequestException('동일 그룹명을 가진 그룹에 소속되어 있습니다.');
        }
        const newGroup = this.groupRepository.create({ groupName });
        const savedGroup = await this.groupRepository.save(newGroup);
        const userGroup = this.userGroupRepository.create({
            userUuid: creatorUuid,
            group: savedGroup,
            isAdmin: true,
        });
        await this.userGroupRepository.save(userGroup);
        const response = {
            groupId: savedGroup.groupId,
            groupName: savedGroup.groupName,
            createdAt: savedGroup.createdAt,
            memberCount: 1,
            isAdmin: true,
        };
        return response;
    }
    async inviteGroupMembers(inviteGroupMemberDto, inviterUuid) {
        const { groupId, inviteeUuids } = inviteGroupMemberDto;
        const group = await this.groupRepository.findOne({
            where: { groupId },
            relations: ['userGroups'],
        });
        if (!group) {
            throw new common_1.NotFoundException('해당 그룹을 찾지 못했습니다.');
        }
        const isCreator = group.userGroups.some((ug) => ug.userUuid === inviterUuid && ug.isAdmin);
        if (!isCreator) {
            throw new common_1.ForbiddenException('그룹 생성자만이 초대를 할 수 있습니다.');
        }
        const results = await Promise.all(inviteeUuids.map(async (inviteeUuid) => {
            try {
                if (inviteeUuid === inviterUuid) {
                    throw new common_1.BadRequestException('자기 자신을 초대할 수 없습니다.');
                }
                const userExists = await this.usersService.checkUserExists(inviteeUuid);
                if (!userExists) {
                    throw new common_1.NotFoundException('해당 사용자를 찾을 수 없습니다.');
                }
                const existingMember = await this.userGroupRepository.findOne({
                    where: { group: { groupId }, userUuid: inviteeUuid },
                });
                if (existingMember) {
                    throw new common_1.BadRequestException('이미 그룹의 멤버입니다.');
                }
                const existingInvitation = await this.groupInvitationRepository.findOne({
                    where: {
                        group: { groupId },
                        inviteeUuid,
                        status: (0, typeorm_2.In)([
                            manager_invitation_entity_1.InvitationStatus.ACCEPTED,
                            manager_invitation_entity_1.InvitationStatus.PENDING,
                        ]),
                    },
                });
                if (existingInvitation) {
                    if (existingInvitation.status === manager_invitation_entity_1.InvitationStatus.ACCEPTED) {
                        throw new common_1.BadRequestException('이미 수락된 초대가 있습니다.');
                    }
                    else {
                        throw new common_1.BadRequestException('이미 대기 중인 초대가 있습니다.');
                    }
                }
                const newInvitation = this.groupInvitationRepository.create({
                    group: { groupId },
                    inviterUuid,
                    inviteeUuid,
                    status: manager_invitation_entity_1.InvitationStatus.PENDING,
                });
                const savedInvitation = await this.groupInvitationRepository.save(newInvitation);
                return {
                    inviteeUuid,
                    status: manager_invitation_entity_1.InvitationStatus.PENDING,
                    invitationId: savedInvitation.groupInvitationId,
                };
            }
            catch (error) {
                return { inviteeUuid, message: error.message };
            }
        }));
        return {
            results,
        };
    }
    async acceptInvitation(id, inviteeUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.inviteeUuid !== inviteeUuid) {
            throw new common_1.UnauthorizedException('초대받은 사람만이 수락할 수 있습니다.');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.ForbiddenException('현재 수신 중인 초대만 수락할 수 있습니다.');
        }
        await this.dataSource.transaction(async (transactionalEntityManager) => {
            invitation.status = manager_invitation_entity_1.InvitationStatus.ACCEPTED;
            await transactionalEntityManager.save(invitation);
            const group = await transactionalEntityManager.findOne(group_entity_1.Group, {
                where: { groupId: invitation.group.groupId },
            });
            if (!group) {
                throw new common_1.NotFoundException(`해당 그룹 ID : ${invitation.group.groupId} 를 가진 그룹은 없습니다.`);
            }
            const userGroup = new user_group_entity_1.UserGroup();
            userGroup.userUuid = invitation.inviteeUuid;
            userGroup.group = group;
            userGroup.isAdmin = false;
            await transactionalEntityManager.save(userGroup);
        });
        return { message: '초대가 성공적으로 수락되었습니다.' };
    }
    async rejectInvitation(id, inviteeUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.inviteeUuid !== inviteeUuid) {
            throw new common_1.UnauthorizedException('초대받은 사람만이 거절할 수 있습니다.');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.ForbiddenException('현재 수신 중인 초대만 거절할 수 있습니다');
        }
        invitation.status = manager_invitation_entity_1.InvitationStatus.REJECTED;
        await this.groupInvitationRepository.save(invitation);
        return { message: '초대가 성공적으로 거절되었습니다.' };
    }
    async cancelInvitation(id, inviterUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.inviterUuid !== inviterUuid) {
            throw new common_1.UnauthorizedException('초대한 사람만이 철회할 수 있습니다');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.ForbiddenException('현재 수신 중인 초대만 철회할 수 있습니다');
        }
        invitation.status = manager_invitation_entity_1.InvitationStatus.CANCELED;
        await this.groupInvitationRepository.save(invitation);
        return { message: '초대가 성공적으로 철회되었습니다.' };
    }
    async getSentInvitations(userUuid) {
        const invitations = await this.groupInvitationRepository.find({
            where: { inviterUuid: userUuid },
            relations: ['group'],
            order: { updatedAt: 'DESC' },
        });
        return invitations.map((invitation) => ({
            invitationId: invitation.groupInvitationId,
            groupId: invitation.group.groupId,
            inviterUuid: invitation.inviterUuid,
            inviteeUuid: invitation.inviteeUuid,
            status: invitation.status,
        }));
    }
    async getReceivedInvitations(userUuid) {
        const invitations = await this.groupInvitationRepository.find({
            where: { inviteeUuid: userUuid },
            relations: ['group'],
            order: { updatedAt: 'DESC' },
        });
        return invitations.map((invitation) => ({
            invitationId: invitation.groupInvitationId,
            groupId: invitation.group.groupId,
            inviterUuid: invitation.inviterUuid,
            inviteeUuid: invitation.inviteeUuid,
            status: invitation.status,
        }));
    }
    async getInvitation(invitationId) {
        const invitation = await this.groupInvitationRepository.findOne({
            where: { groupInvitationId: invitationId },
            relations: ['group'],
            order: { updatedAt: 'DESC' },
        });
        if (!invitation) {
            throw new common_1.NotFoundException(`초대 ID ${invitationId}를 찾을 수 없습니다.`);
        }
        return invitation;
    }
    async deleteGroup(groupId, adminUuid) {
        const group = await this.groupRepository.findOne({
            where: { groupId },
            relations: ['userGroups'],
        });
        if (!group) {
            throw new common_1.NotFoundException('해당 그룹을 찾을 수 없습니다.');
        }
        const adminUserGroup = group.userGroups.find((ug) => ug.userUuid === adminUuid && ug.isAdmin);
        if (!adminUserGroup) {
            throw new common_1.ForbiddenException('그룹 관리자만이 그룹을 삭제할 수 있습니다.');
        }
        await this.dataSource.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.delete(group_invitation_entity_1.GroupInvitation, {
                group: { groupId },
            });
            await transactionalEntityManager.delete(user_group_entity_1.UserGroup, {
                group: { groupId },
            });
            await transactionalEntityManager.delete(group_entity_1.Group, { groupId });
        });
    }
    async getUserGroups(userUuid) {
        const userGroups = await this.userGroupRepository.find({
            where: { userUuid: userUuid },
            relations: ['group'],
        });
        if (!userGroups || userGroups.length === 0) {
            return [];
        }
        const groupIds = userGroups.map((ug) => ug.group.groupId);
        const memberCounts = await this.groupRepository
            .createQueryBuilder('group')
            .select('group.groupId', 'groupId')
            .addSelect('COUNT(userGroup.userGroupId)', 'memberCount')
            .leftJoin('group.userGroups', 'userGroup')
            .where('group.groupId IN (:...groupIds)', { groupIds })
            .groupBy('group.groupId')
            .getRawMany();
        const memberCountMap = new Map(memberCounts.map((mc) => [mc.groupId, parseInt(mc.memberCount)]));
        return userGroups
            .map((userGroup) => {
            if (!userGroup.group) {
                console.error(`해당 유저 그룹 ID : ${userGroup.userGroupId} 를 가진 그룹을 찾을 수 없습니다.`);
                return null;
            }
            return {
                groupId: userGroup.group.groupId,
                groupName: userGroup.group.groupName,
                createdAt: userGroup.group.createdAt,
                memberCount: memberCountMap.get(userGroup.group.groupId) || 0,
                isAdmin: userGroup.isAdmin,
            };
        })
            .filter(Boolean);
    }
    async getGroupMembers(groupId, requestingUserUuid) {
        const requestingUserGroup = await this.userGroupRepository.findOne({
            where: { group: { groupId }, userUuid: requestingUserUuid },
        });
        if (!requestingUserGroup) {
            throw new common_1.ForbiddenException('당신은 해당 그룹의 멤버가 아닙니다.');
        }
        const userGroups = await this.userGroupRepository.find({
            where: { group: { groupId } },
            order: { createdAt: 'ASC' },
        });
        if (!userGroups || userGroups.length === 0) {
            throw new common_1.NotFoundException(`해당 그룹 ID : ${groupId} 를 가진 그룹의 구성원이 없습니다.`);
        }
        const groupMembers = await Promise.all(userGroups.map(async (userGroup) => {
            const user = await this.usersService.findOne(userGroup.userUuid);
            return {
                userUuid: userGroup.userUuid,
                name: user.name,
                isAdmin: userGroup.isAdmin,
                joinedAt: userGroup.createdAt,
            };
        }));
        return groupMembers;
    }
    async removeGroupMember(removeGroupMemberDto, adminUuid) {
        const { groupId, memberUuid } = removeGroupMemberDto;
        console.log(removeGroupMemberDto);
        const group = await this.groupRepository.findOne({
            where: { groupId },
            relations: ['userGroups'],
        });
        if (!group) {
            throw new common_1.NotFoundException('해당 그룹을 찾을 수 없습니다.');
        }
        const adminUserGroup = group.userGroups.find((ug) => ug.userUuid === adminUuid && ug.isAdmin);
        if (!adminUserGroup) {
            throw new common_1.ForbiddenException('그룹 관리자만이 멤버를 추방할 수 있습니다.');
        }
        const memberUserGroup = await this.userGroupRepository.findOne({
            where: { group: { groupId }, userUuid: memberUuid },
        });
        if (!memberUserGroup) {
            throw new common_1.NotFoundException('해당 멤버를 그룹에서 찾을 수 없습니다.');
        }
        if (adminUuid === memberUuid) {
            throw new common_1.ForbiddenException('자신을 그룹에서 추방할 수 없습니다.');
        }
        await this.userGroupRepository.remove(memberUserGroup);
        const invitation = await this.groupInvitationRepository.findOne({
            where: { group: { groupId }, inviteeUuid: memberUuid },
        });
        if (invitation) {
            invitation.status = manager_invitation_entity_1.InvitationStatus.REMOVED;
            await this.groupInvitationRepository.save(invitation);
        }
    }
    async getGroupDetail(groupId, userUuid) {
        const group = await this.groupRepository.findOne({
            where: { groupId },
            relations: ['userGroups'],
        });
        if (!group) {
            throw new common_1.NotFoundException('해당 그룹을 찾을 수 없습니다.');
        }
        const userGroup = group.userGroups.find((ug) => ug.userUuid === userUuid);
        if (!userGroup) {
            throw new common_1.ForbiddenException('당신은 해당 그룹의 멤버가 아닙니다.');
        }
        const memberCount = group.userGroups.length;
        const members = await Promise.all(group.userGroups.map(async (ug) => {
            const user = await this.usersService.findOne(ug.userUuid);
            return {
                userUuid: ug.userUuid,
                name: user.name,
                isAdmin: ug.isAdmin,
                joinedAt: ug.createdAt,
            };
        }));
        members.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
        return {
            groupId: group.groupId,
            groupName: group.groupName,
            createdAt: group.createdAt,
            memberCount,
            isAdmin: userGroup.isAdmin,
            members,
        };
    }
    async getGroupInvitationDetail(invitationId) {
        const invitation = await this.groupInvitationRepository.findOne({
            where: { groupInvitationId: invitationId },
            relations: ['group'],
        });
        if (!invitation) {
            throw new common_1.NotFoundException(`초대 ID ${invitationId}를 찾을 수 없습니다.`);
        }
        const inviter = await this.usersService.findOne(invitation.inviterUuid);
        const invitee = await this.usersService.findOne(invitation.inviteeUuid);
        return {
            inviterUuid: invitation.inviterUuid,
            inviterName: inviter.name,
            inviteeUuid: invitation.inviteeUuid,
            inviteeName: invitee.name,
            groupName: invitation.group.groupName,
            groupId: invitation.group.groupId,
            status: invitation.status,
        };
    }
    async linkScheduleToGroupsAndUsers(schedule, groupInfo) {
        for (const info of groupInfo) {
            const group = await this.groupRepository.findOne({
                where: { groupId: info.groupId },
            });
            if (!group) {
                throw new common_1.BadRequestException(`그룹 ID ${info.groupId}를 찾을 수 없습니다.`);
            }
            for (const userUuid of info.userUuids) {
                const groupSchedule = this.groupScheduleRepository.create({
                    userUuid,
                    group,
                    schedule,
                });
                await this.groupScheduleRepository.save(groupSchedule);
            }
        }
    }
    async getUsersForGroup(groupId) {
        const userGroups = await this.userGroupRepository.find({
            where: { group: { groupId } },
            relations: ['group'],
        });
        if (userGroups.length === 0) {
            throw new common_1.NotFoundException(`해당 그룹ID :  ${groupId} 를 가진 그룹의 멤버가 없습니다.`);
        }
        const userUuids = userGroups.map((ug) => ug.userUuid);
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.userUuid IN (:...userUuids)', { userUuids })
            .getMany();
        return users.map((user) => ({
            userUuid: user.userUuid,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            isAdmin: userGroups.find((ug) => ug.userUuid === user.userUuid).isAdmin,
        }));
    }
    async removeGroupMembersFromSchedule(scheduleId, groupInfo) {
        for (const group of groupInfo) {
            try {
                const groupUsers = await this.getUsersForGroup(group.groupId);
                const validUserUuids = groupUsers.map((user) => user.userUuid);
                for (const userUuid of group.userUuids) {
                    if (validUserUuids.includes(userUuid)) {
                        await this.groupScheduleRepository.delete({
                            schedule: { scheduleId },
                            group: { groupId: group.groupId },
                            userUuid,
                        });
                    }
                    else {
                        console.warn(`사용자 ${userUuid}는 그룹 ${group.groupId}의 멤버가 아닙니다. 제거를 건너뜁니다.`);
                    }
                }
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    console.error(`그룹 ${group.groupId}에 대한 사용자 정보를 찾을 수 없습니다: ${error.message}`);
                }
                else {
                    throw new common_1.InternalServerErrorException(`그룹 멤버 제거 중 오류가 발생했습니다: ${error.message}`);
                }
            }
        }
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(1, (0, typeorm_1.InjectRepository)(user_group_entity_1.UserGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(group_invitation_entity_1.GroupInvitation)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(6, (0, typeorm_1.InjectRepository)(group_schedule_entity_1.GroupSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        users_service_1.UsersService,
        typeorm_2.Repository])
], GroupService);
//# sourceMappingURL=group.service.js.map