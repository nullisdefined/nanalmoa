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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const auth_entity_1 = require("../../entities/auth.entity");
let UsersService = class UsersService {
    constructor(userRepository, authRepository) {
        this.userRepository = userRepository;
        this.authRepository = authRepository;
    }
    async getUserByUuid(userUuid) {
        if (!userUuid) {
            throw new common_1.NotFoundException('사용자 UUID가 없습니다.');
        }
        const auth = await this.authRepository.findOne({
            where: { userUuid },
            relations: ['user'],
        });
        if (!auth || !auth.user) {
            throw new common_1.NotFoundException(`사용자 UUID ${userUuid}를 찾을 수 없습니다.`);
        }
        return auth.user;
    }
    async getUsersByUuids(userUuids) {
        if (!userUuids.length) {
            return [];
        }
        const users = await Promise.all(userUuids.map((uuid) => this.getUserByUuid(uuid).catch(() => null)));
        const validUsers = users.filter((user) => user !== null);
        if (validUsers.length !== userUuids.length) {
            throw new common_1.NotFoundException('일부 사용자를 찾을 수 없습니다.');
        }
        return validUsers;
    }
    async checkUserExists(userUuid) {
        try {
            await this.getUserByUuid(userUuid);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                return false;
            }
            throw error;
        }
    }
    determineSearchType(keyword) {
        if (/^\d{10,11}$/.test(keyword)) {
            return 'phoneNumber';
        }
        else if (/^(\d{2,3})-?(\d{3,4})-?(\d{4})$/.test(keyword)) {
            return 'phoneNumber';
        }
        else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(keyword)) {
            return 'email';
        }
        else {
            return 'name';
        }
    }
    async searchUser(keyword) {
        const searchType = this.determineSearchType(keyword);
        let users = [];
        switch (searchType) {
            case 'phoneNumber':
                users = await this.userRepository.find({
                    where: [{ phoneNumber: keyword }],
                });
                break;
            case 'email':
                users = await this.userRepository.find({
                    where: [{ email: keyword }],
                });
                break;
            case 'name':
                users = await this.userRepository.find({
                    where: [{ name: keyword }],
                });
                break;
        }
        return users;
    }
    async updateUser(userUuid, updateData) {
        const user = await this.userRepository.findOne({ where: { userUuid } });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }
    async isEmailTaken(email, currentUserUuid) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email });
        if (currentUserUuid) {
            query.andWhere('user.userUuid != :userUuid', {
                userUuid: currentUserUuid,
            });
        }
        const count = await query.getCount();
        return count > 0;
    }
    async findOne(userUuid) {
        const user = await this.userRepository.findOne({ where: { userUuid } });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_2.InjectRepository)(auth_entity_1.Auth)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map