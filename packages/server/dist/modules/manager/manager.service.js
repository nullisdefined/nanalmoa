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
var ManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manager_invitation_entity_1 = require("../../entities/manager-invitation.entity");
const manager_subordinate_entity_1 = require("../../entities/manager-subordinate.entity");
const user_response_dto_1 = require("../users/dto/user-response.dto");
const users_service_1 = require("../users/users.service");
let ManagerService = ManagerService_1 = class ManagerService {
    constructor(managerInvitationRepository, managerSubordinateRepository, usersService) {
        this.managerInvitationRepository = managerInvitationRepository;
        this.managerSubordinateRepository = managerSubordinateRepository;
        this.usersService = usersService;
        this.logger = new common_1.Logger(ManagerService_1.name);
    }
    async validateUsers(createInvitationDto) {
        const [managerExists, subordinateExists] = await Promise.all([
            this.usersService.checkUserExists(createInvitationDto.managerUuid),
            this.usersService.checkUserExists(createInvitationDto.subordinateUuid),
        ]);
        if (!managerExists) {
            throw new common_1.NotFoundException(`관리자 UUID ${createInvitationDto.managerUuid}를 찾을 수 없습니다.`);
        }
        if (!subordinateExists) {
            throw new common_1.NotFoundException(`피관리자 UUID ${createInvitationDto.subordinateUuid}를 찾을 수 없습니다.`);
        }
        if (createInvitationDto.managerUuid === createInvitationDto.subordinateUuid) {
            throw new common_1.BadRequestException(`관리자 UUID ${createInvitationDto.managerUuid}와 피관리자 UUID ${createInvitationDto.managerUuid}를 같게 설정할 수 없습니다.`);
        }
    }
    async getInvitation(id) {
        if (isNaN(id)) {
            throw new common_1.BadRequestException('유효하지 않은 초대장 ID입니다.');
        }
        const invitation = await this.managerInvitationRepository.findOne({
            where: { managerInvitationId: id },
            order: { updatedAt: 'DESC' },
        });
        if (!invitation) {
            throw new common_1.NotFoundException(`ID가 ${id}인 초대장을 찾을 수 없습니다.`);
        }
        const manager = await this.usersService.findOne(invitation.managerUuid);
        const subordinate = await this.usersService.findOne(invitation.managerUuid);
        return {
            ...invitation,
            managerName: manager.name,
            subordinateName: subordinate.name,
        };
    }
    async createInvitation(createInvitationDto) {
        try {
            await this.validateUsers(createInvitationDto);
            const { managerUuid, subordinateUuid } = createInvitationDto;
            const existingInvitation = await this.managerInvitationRepository.findOne({
                where: {
                    managerUuid,
                    subordinateUuid,
                    status: manager_invitation_entity_1.InvitationStatus.PENDING,
                },
            });
            if (existingInvitation) {
                throw new common_1.BadRequestException('이미 대기 중인 초대가 있습니다.');
            }
            const existingRelation = await this.managerSubordinateRepository.findOne({
                where: { managerUuid, subordinateUuid },
            });
            if (existingRelation) {
                throw new common_1.BadRequestException('이미 관리자-피관리자 관계가 존재합니다.');
            }
            const invitation = this.managerInvitationRepository.create({
                managerUuid,
                subordinateUuid,
                status: manager_invitation_entity_1.InvitationStatus.PENDING,
            });
            const manager = this.usersService.findOne(managerUuid);
            const subordinate = this.usersService.findOne(subordinateUuid);
            await this.managerInvitationRepository.save(invitation);
            return {
                ...invitation,
                managerName: (await manager).name,
                subordinateName: (await subordinate).name,
            };
        }
        catch (error) {
            this.logger.error(`초대장 생성 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('초대장 생성 중 오류가 발생했습니다.');
        }
    }
    async acceptInvitation(id, subordinateUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.subordinateUuid !== subordinateUuid) {
            throw new common_1.ForbiddenException('초대를 수락할 권한이 없습니다.');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('대기 중인 초대만 수락할 수 있습니다.');
        }
        invitation.status = manager_invitation_entity_1.InvitationStatus.ACCEPTED;
        await this.managerInvitationRepository.save(invitation);
        await this.createManagerSubordinate(invitation);
        return invitation;
    }
    async rejectInvitation(id, subordinateUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.subordinateUuid !== subordinateUuid) {
            throw new common_1.ForbiddenException('초대를 거절할 권한이 없습니다.');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('대기 중인 초대만 거절할 수 있습니다.');
        }
        invitation.status = manager_invitation_entity_1.InvitationStatus.REJECTED;
        return await this.managerInvitationRepository.save(invitation);
    }
    async cancelInvitation(id, managerUuid) {
        const invitation = await this.getInvitation(id);
        if (invitation.managerUuid !== managerUuid) {
            throw new common_1.ForbiddenException('초대를 철회할 권한이 없습니다.');
        }
        if (invitation.status !== manager_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('대기 중인 초대만 철회할 수 있습니다.');
        }
        invitation.status = manager_invitation_entity_1.InvitationStatus.CANCELED;
        return await this.managerInvitationRepository.save(invitation);
    }
    async removeManagerSubordinate(managerUuid, subordinateUuid) {
        const relation = await this.managerSubordinateRepository.findOne({
            where: { managerUuid, subordinateUuid },
        });
        if (!relation) {
            throw new common_1.NotFoundException('관리자-피관리자 관계를 찾을 수 없습니다.');
        }
        await this.managerSubordinateRepository.remove(relation);
        const invitation = await this.managerInvitationRepository.findOne({
            where: {
                managerUuid,
                subordinateUuid,
                status: manager_invitation_entity_1.InvitationStatus.ACCEPTED,
            },
        });
        if (invitation) {
            invitation.status = manager_invitation_entity_1.InvitationStatus.REMOVED;
            await this.managerInvitationRepository.save(invitation);
        }
    }
    async createManagerSubordinate(invitation) {
        try {
            const managerSubordinate = this.managerSubordinateRepository.create({
                managerUuid: invitation.managerUuid,
                subordinateUuid: invitation.subordinateUuid,
            });
            await this.managerSubordinateRepository.save(managerSubordinate);
        }
        catch (error) {
            this.logger.error(`관리자-피관리자 관계 생성 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('관리자-피관리자 관계 생성 중 오류가 발생했습니다.');
        }
    }
    async getInvitationSend(getInvitationSendDto) {
        try {
            const invitations = await this.managerInvitationRepository.find({
                where: { managerUuid: getInvitationSendDto.managerUuid },
            });
            this.logger.log(`관리자 ${getInvitationSendDto.managerUuid}가 보낸 ${invitations.length}개의 초대장을 조회했습니다.`);
            const invitationResponses = await Promise.all(invitations.map(async (invitation) => {
                const manager = await this.usersService.findOne(invitation.managerUuid);
                const subordinate = await this.usersService.findOne(invitation.subordinateUuid);
                return {
                    ...invitation,
                    managerName: manager.name,
                    subordinateName: subordinate.name,
                };
            }));
            return invitationResponses;
        }
        catch (error) {
            this.logger.error(`보낸 초대장 조회 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('보낸 초대장 조회 중 오류가 발생했습니다.');
        }
    }
    async getInvitationReceived(getInvitationReceivedDto) {
        try {
            const invitations = await this.managerInvitationRepository.find({
                where: { subordinateUuid: getInvitationReceivedDto.subordinateUuid },
            });
            const invitationResponses = await Promise.all(invitations.map(async (invitation) => {
                const manager = await this.usersService.findOne(invitation.managerUuid);
                const subordinate = await this.usersService.findOne(invitation.subordinateUuid);
                return {
                    ...invitation,
                    managerName: manager.name,
                    subordinateName: subordinate.name,
                };
            }));
            this.logger.log(`부하 ${getInvitationReceivedDto.subordinateUuid}가 받은 ${invitations.length}개의 초대장을 조회했습니다.`);
            return invitationResponses;
        }
        catch (error) {
            this.logger.error(`받은 초대장 조회 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('받은 초대장 조회 중 오류가 발생했습니다.');
        }
    }
    async getInvitationUsers(createManagerSubordinateDto) {
        try {
            const invitation = await this.managerInvitationRepository.findOne({
                where: {
                    subordinateUuid: createManagerSubordinateDto.subordinateUuid,
                    managerUuid: createManagerSubordinateDto.managerUuid,
                },
            });
            if (!invitation) {
                this.logger.warn(`관리자 ${createManagerSubordinateDto.managerUuid}와 피관리자 ${createManagerSubordinateDto.subordinateUuid} 간의 초대장을 찾을 수 없습니다.`);
                throw new common_1.NotFoundException('지정된 관리자와 피관리자 간의 초대장을 찾을 수 없습니다.');
            }
            this.logger.log(`관리자 ${createManagerSubordinateDto.managerUuid}와 피관리자 ${createManagerSubordinateDto.subordinateUuid} 간의 초대장을 조회했습니다.`);
            const manager = this.usersService.findOne(invitation.managerUuid);
            const subordinate = this.usersService.findOne(invitation.subordinateUuid);
            return {
                ...invitation,
                managerName: (await manager).name,
                subordinateName: (await subordinate).name,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`사용자 간 초대장 조회 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('사용자 간 초대장 조회 중 오류가 발생했습니다.');
        }
    }
    async getManagerList(subordinateUuid) {
        try {
            const managerSubordinates = await this.managerSubordinateRepository.find({
                where: { subordinateUuid },
            });
            const managerUuids = managerSubordinates.map((ms) => ms.managerUuid);
            const managers = await this.usersService.getUsersByUuids(managerUuids);
            this.logger.log(`사용자 ${subordinateUuid}의 관리자 ${managers.length}명을 조회했습니다.`);
            return managers.map((manager) => new user_response_dto_1.UserResponseDto(manager));
        }
        catch (error) {
            this.logger.error(`관리자 목록 조회 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('관리자 목록 조회 중 오류가 발생했습니다.');
        }
    }
    async getSubordinateList(managerUuid) {
        try {
            const managerSubordinates = await this.managerSubordinateRepository.find({
                where: { managerUuid },
            });
            const subordinateUuids = managerSubordinates.map((ms) => ms.subordinateUuid);
            const subordinates = await this.usersService.getUsersByUuids(subordinateUuids);
            this.logger.log(`관리자 ${managerUuid}의 피관리자 ${subordinates.length}명을 조회했습니다.`);
            return subordinates.map((subordinate) => new user_response_dto_1.UserResponseDto(subordinate));
        }
        catch (error) {
            this.logger.error(`피관리자 목록 조회 실패: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('피관리자 목록 조회 중 오류가 발생했습니다.');
        }
    }
    async validateAndCheckManagerRelation(managerUuid, subordinateUuid) {
        try {
            await this.validateUsers({ managerUuid, subordinateUuid });
            const relation = await this.managerSubordinateRepository.findOne({
                where: { managerUuid, subordinateUuid },
            });
            if (relation) {
                this.logger.log(`사용자 ${managerUuid}는 ${subordinateUuid}의 관리자입니다.`);
                return true;
            }
            else {
                this.logger.log(`사용자 ${managerUuid}는 ${subordinateUuid}의 관리자가 아닙니다.`);
                return false;
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`관리자 관계 확인 중 오류 발생: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('관리자 관계 확인 중 오류가 발생했습니다.');
        }
    }
};
exports.ManagerService = ManagerService;
exports.ManagerService = ManagerService = ManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manager_invitation_entity_1.ManagerInvitation)),
    __param(1, (0, typeorm_1.InjectRepository)(manager_subordinate_entity_1.ManagerSubordinate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], ManagerService);
//# sourceMappingURL=manager.service.js.map