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
exports.UsersRoutineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_routine_entity_1 = require("../../entities/user-routine.entity");
const users_service_1 = require("./users.service");
let UsersRoutineService = class UsersRoutineService {
    constructor(userRoutineRepository, usersService) {
        this.userRoutineRepository = userRoutineRepository;
        this.usersService = usersService;
    }
    async updateUserRoutine(userUuid, updateDto) {
        if (!userUuid) {
            throw new common_1.BadRequestException('User UUID is required');
        }
        await this.usersService.checkUserExists(userUuid);
        let userRoutine = await this.userRoutineRepository.findOne({
            where: { userUuid },
        });
        if (userRoutine) {
            Object.assign(userRoutine, updateDto);
        }
        else {
            userRoutine = this.userRoutineRepository.create({
                ...this.getDefaultRoutine(userUuid),
                ...updateDto,
                userUuid,
            });
        }
        this.validateTimeOrder(userRoutine);
        await this.userRoutineRepository.save(userRoutine);
        return this.mapToResponseDto(userRoutine);
    }
    async getUserRoutine(userUuid) {
        if (!userUuid) {
            throw new common_1.BadRequestException('User UUID is required');
        }
        await this.usersService.checkUserExists(userUuid);
        const userRoutine = await this.userRoutineRepository.findOne({
            where: { userUuid },
        });
        if (!userRoutine) {
            return this.mapToResponseDto(this.getDefaultRoutine(userUuid));
        }
        return this.mapToResponseDto(userRoutine);
    }
    validateTimeOrder(routine) {
        const times = [
            routine.wakeUpTime,
            routine.breakfastTime,
            routine.lunchTime,
            routine.dinnerTime,
            routine.bedTime,
        ];
        for (let i = 1; i < times.length; i++) {
            if (new Date(`1970-01-01T${times[i]}`) <=
                new Date(`1970-01-01T${times[i - 1]}`)) {
                throw new Error('시간 순서가 올바르지 않습니다.');
            }
        }
    }
    mapToResponseDto(routine) {
        return {
            userUuid: routine.userUuid,
            wakeUpTime: routine.wakeUpTime,
            breakfastTime: routine.breakfastTime,
            lunchTime: routine.lunchTime,
            dinnerTime: routine.dinnerTime,
            bedTime: routine.bedTime,
        };
    }
    getDefaultRoutine(userUuid) {
        return {
            userUuid,
            wakeUpTime: '07:00',
            breakfastTime: '08:00',
            lunchTime: '12:00',
            dinnerTime: '18:00',
            bedTime: '22:00',
        };
    }
};
exports.UsersRoutineService = UsersRoutineService;
exports.UsersRoutineService = UsersRoutineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_routine_entity_1.UserRoutine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], UsersRoutineService);
//# sourceMappingURL=users-routine.service.js.map