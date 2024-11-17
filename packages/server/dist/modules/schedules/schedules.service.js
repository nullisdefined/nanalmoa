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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SchedulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("../../entities/schedule.entity");
const category_entity_1 = require("../../entities/category.entity");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const response_schedule_dto_1 = require("./dto/response-schedule.dto");
const config_1 = require("@nestjs/config");
const voice_transcription_service_1 = require("./voice-transcription.service");
const users_service_1 = require("../users/users.service");
const openai_1 = __importDefault(require("openai"));
const group_service_1 = require("../group/group.service");
const group_schedule_entity_1 = require("../../entities/group-schedule.entity");
let SchedulesService = SchedulesService_1 = class SchedulesService {
    constructor(schedulesRepository, categoryRepository, configService, voiceTranscriptionService, usersService, groupScheduleRepository, groupService) {
        this.schedulesRepository = schedulesRepository;
        this.categoryRepository = categoryRepository;
        this.configService = configService;
        this.voiceTranscriptionService = voiceTranscriptionService;
        this.usersService = usersService;
        this.groupScheduleRepository = groupScheduleRepository;
        this.groupService = groupService;
        this.logger = new common_1.Logger(SchedulesService_1.name);
        const openaiApiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey: openaiApiKey });
    }
    async findAllByUserUuid(userUuid) {
        const startDate = new Date(Date.UTC(2000, 0, 1));
        const endDate = new Date(Date.UTC(2100, 11, 31, 23, 59, 59, 999));
        return this.getSchedulesInRange(userUuid, startDate, endDate);
    }
    async getSchedulesInRange(userUuid, startDate, endDate) {
        const [regularSchedules, recurringSchedules] = await Promise.all([
            this.findRegularSchedulesInRange(userUuid, startDate, endDate),
            this.findRecurringSchedules(userUuid),
        ]);
        const expandedRecurringSchedules = this.expandRecurringSchedules(recurringSchedules, startDate, endDate);
        const sharedGroupSchedules = await this.findSharedGroupSchedules(userUuid, startDate, endDate);
        const allSchedules = [
            ...regularSchedules,
            ...expandedRecurringSchedules,
            ...sharedGroupSchedules,
        ];
        allSchedules.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        const convertedSchedules = await Promise.all(allSchedules.map((schedule) => this.convertToResponseDto(schedule)));
        return convertedSchedules;
    }
    async findSharedGroupSchedules(userUuid, startDate, endDate) {
        return this.schedulesRepository
            .createQueryBuilder('schedule')
            .innerJoin('schedule.groupSchedules', 'groupSchedule')
            .where('groupSchedule.userUuid = :userUuid', { userUuid })
            .andWhere('schedule.startDate <= :endDate', { endDate })
            .andWhere('schedule.endDate >= :startDate', { startDate })
            .getMany();
    }
    async findSharedGroupSchedulesByScheduleId(userUuid, scheduleId) {
        return this.schedulesRepository
            .createQueryBuilder('schedule')
            .innerJoin('schedule.groupSchedules', 'groupSchedule')
            .where('groupSchedule.userUuid = :userUuid', { userUuid })
            .andWhere('schedule.scheduleId = :scheduleId', { scheduleId })
            .getOne();
    }
    async findByMonth(userUuid, year, month) {
        await this.validateUser(userUuid);
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        return this.getSchedulesInRange(userUuid, startDate, endDate);
    }
    async findByWeek(userUuid, date) {
        await this.validateUser(userUuid);
        const inputDate = new Date(date);
        inputDate.setUTCHours(0, 0, 0, 0);
        const dayOfWeek = inputDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStartDate = new Date(inputDate);
        weekStartDate.setDate(inputDate.getDate() + daysToMonday);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        weekEndDate.setUTCHours(23, 59, 59, 999);
        return this.getSchedulesInRange(userUuid, weekStartDate, weekEndDate);
    }
    async findByDate(dateQuery) {
        await this.validateUser(dateQuery.userUuid);
        const startOfDay = new Date(dateQuery.date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateQuery.date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        return this.getSchedulesInRange(dateQuery.userUuid, startOfDay, endOfDay);
    }
    async findByYear(userUuid, year) {
        await this.validateUser(userUuid);
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
        return this.getSchedulesInRange(userUuid, startDate, endDate);
    }
    async findOne(id) {
        const schedule = await this.schedulesRepository.findOne({
            where: { scheduleId: id },
            relations: ['category'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`해당 id : ${id}를 가진 일정을 찾을 수 없습니다.`);
        }
        return this.convertToResponseDto(schedule);
    }
    async createSchedule(userUuid, createScheduleDto) {
        const category = await this.getCategoryById(createScheduleDto.categoryId ?? 7);
        const startDate = new Date(createScheduleDto.startDate);
        const endDate = new Date(createScheduleDto.endDate);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('종료일은 시작일보다 이후여야 합니다.');
        }
        if (createScheduleDto.isRecurring) {
            if (!createScheduleDto.repeatEndDate) {
                throw new common_1.BadRequestException('반복 일정은 반드시 종료일(repeatEndDate)을 지정해야 합니다.');
            }
            const repeatEndDate = new Date(createScheduleDto.repeatEndDate);
            if (repeatEndDate <= endDate) {
                throw new common_1.BadRequestException('반복 일정의 종료일은 일정의 종료일보다 이후여야 합니다.');
            }
            this.validateRecurringOptions(createScheduleDto);
        }
        else {
            createScheduleDto.repeatType = null;
            createScheduleDto.repeatEndDate = null;
            createScheduleDto.recurringInterval = null;
            createScheduleDto.recurringDaysOfWeek = null;
            createScheduleDto.recurringDayOfMonth = null;
            createScheduleDto.recurringMonthOfYear = null;
        }
        const newSchedule = this.schedulesRepository.create({
            ...createScheduleDto,
            userUuid,
            category,
            isRecurring: createScheduleDto.isRecurring,
        });
        if (newSchedule.isAllDay) {
            ;
            [newSchedule.startDate, newSchedule.endDate] = this.adjustDateForAllDay(newSchedule.startDate, newSchedule.endDate);
        }
        const savedSchedule = await this.schedulesRepository.save(newSchedule);
        if (createScheduleDto.groupInfo && createScheduleDto.groupInfo.length > 0) {
            await this.groupService.linkScheduleToGroupsAndUsers(savedSchedule, createScheduleDto.groupInfo);
        }
        return this.convertToResponseDto(savedSchedule);
    }
    validateRecurringOptions(createScheduleDto) {
        const { repeatType, recurringDaysOfWeek, recurringDayOfMonth, recurringMonthOfYear, } = createScheduleDto;
        switch (repeatType) {
            case 'weekly':
                if (recurringMonthOfYear !== null) {
                    throw new common_1.BadRequestException('주간 반복에서는 recurringMonthOfYear를 설정할 수 없습니다.');
                }
                if (!recurringDaysOfWeek || recurringDaysOfWeek.length === 0) {
                    throw new common_1.BadRequestException('주간 반복에서는 recurringDaysOfWeek를 반드시 설정해야 합니다.');
                }
                break;
            case 'monthly':
                if (recurringMonthOfYear !== null) {
                    throw new common_1.BadRequestException('월간 반복에서는 recurringMonthOfYear를 설정할 수 없습니다.');
                }
                if (recurringDayOfMonth === null) {
                    throw new common_1.BadRequestException('월간 반복에서는 recurringDayOfMonth를 반드시 설정해야 합니다.');
                }
                break;
            case 'yearly':
                if (recurringMonthOfYear === null) {
                    throw new common_1.BadRequestException('연간 반복에서는 recurringMonthOfYear를 반드시 설정해야 합니다.');
                }
                if (recurringDayOfMonth === null) {
                    throw new common_1.BadRequestException('연간 반복에서는 recurringDayOfMonth를 반드시 설정해야 합니다.');
                }
                break;
        }
    }
    async updateSchedule(userUuid, scheduleId, updateScheduleDto, instanceDate, updateType = 'single') {
        let schedule = await this.schedulesRepository.findOne({
            where: { scheduleId, userUuid },
            relations: ['category'],
        });
        if (!schedule) {
            schedule = await this.findSharedGroupSchedulesByScheduleId(userUuid, scheduleId);
        }
        if (!schedule) {
            throw new common_1.NotFoundException(`해당 ID : ${scheduleId}를 가진 일정을 찾을 수 없습니다.`);
        }
        const isCreator = schedule.userUuid === userUuid;
        if (schedule.isRecurring && instanceDate) {
            const isValidDate = this.isOccurrenceDate(schedule, instanceDate);
            if (!isValidDate) {
                throw new common_1.BadRequestException(`지정된 날짜 ${instanceDate}는 이 반복 일정의 유효한 날짜가 아닙니다.`);
            }
        }
        let updatedSchedule;
        if (schedule.isRecurring) {
            if (updateType === 'single') {
                updatedSchedule = await this.updateSingleInstance(schedule, updateScheduleDto, instanceDate);
            }
            else {
                updatedSchedule = await this.updateFutureInstances(schedule, updateScheduleDto, instanceDate);
            }
        }
        else {
            updatedSchedule = await this.updateNonRecurringSchedule(schedule, updateScheduleDto);
        }
        if (isCreator) {
            if (updateScheduleDto.addGroupInfo) {
                await this.groupService.linkScheduleToGroupsAndUsers(updatedSchedule, updateScheduleDto.addGroupInfo);
            }
            if (updateScheduleDto.deleteGroupInfo) {
                await this.groupService.removeGroupMembersFromSchedule(updatedSchedule.scheduleId, updateScheduleDto.deleteGroupInfo);
            }
        }
        return this.convertToResponseDto(updatedSchedule);
    }
    async updateNonRecurringSchedule(schedule, updateScheduleDto) {
        const { categoryId, ...updateData } = updateScheduleDto;
        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                schedule[key] = value;
            }
        });
        if (categoryId !== undefined) {
            const newCategory = await this.getCategoryById(categoryId);
            if (newCategory) {
                schedule.category = newCategory;
            }
        }
        const updatedSchedule = await this.schedulesRepository.save(schedule);
        return this.convertToResponseDto(updatedSchedule);
    }
    async updateSingleInstance(schedule, updateScheduleDto, instanceDate) {
        const originalEndDate = schedule.repeatEndDate;
        schedule.repeatEndDate = new Date(instanceDate);
        schedule.repeatEndDate.setUTCDate(schedule.repeatEndDate.getUTCDate() - 1);
        schedule.repeatEndDate.setUTCHours(23, 59, 59, 999);
        await this.schedulesRepository.save(schedule);
        const updatedInstance = new schedule_entity_1.Schedule();
        Object.assign(updatedInstance, schedule, updateScheduleDto);
        updatedInstance.scheduleId = undefined;
        updatedInstance.startDate = new Date(instanceDate);
        updatedInstance.startDate.setUTCHours(schedule.startDate.getUTCHours(), schedule.startDate.getUTCMinutes());
        updatedInstance.endDate = new Date(instanceDate);
        updatedInstance.endDate.setUTCHours(schedule.endDate.getUTCHours(), schedule.endDate.getUTCMinutes());
        if (updateScheduleDto.startDate) {
            updatedInstance.startDate.setUTCHours(updateScheduleDto.startDate.getUTCHours());
            updatedInstance.startDate.setUTCMinutes(updateScheduleDto.startDate.getUTCMinutes());
        }
        if (updateScheduleDto.endDate) {
            updatedInstance.endDate.setUTCHours(updateScheduleDto.endDate.getUTCHours());
            updatedInstance.endDate.setUTCMinutes(updateScheduleDto.endDate.getUTCMinutes());
        }
        updatedInstance.isRecurring = false;
        updatedInstance.repeatType = 'none';
        updatedInstance.repeatEndDate = null;
        updatedInstance.recurringInterval = null;
        updatedInstance.recurringDaysOfWeek = null;
        updatedInstance.recurringDayOfMonth = null;
        updatedInstance.recurringMonthOfYear = null;
        const savedInstance = await this.schedulesRepository.save(updatedInstance);
        const newSchedule = new schedule_entity_1.Schedule();
        Object.assign(newSchedule, schedule);
        newSchedule.scheduleId = undefined;
        newSchedule.repeatEndDate = originalEndDate;
        const nextStartDate = this.getNextOccurrenceDate(schedule, instanceDate);
        newSchedule.startDate = new Date(nextStartDate);
        newSchedule.startDate.setUTCHours(schedule.startDate.getUTCHours(), schedule.startDate.getUTCMinutes());
        const duration = schedule.endDate.getTime() - schedule.startDate.getTime();
        newSchedule.endDate = new Date(newSchedule.startDate.getTime() + duration);
        newSchedule.endDate.setHours(schedule.endDate.getUTCHours(), schedule.endDate.getUTCMinutes());
        await this.schedulesRepository.save(newSchedule);
        return this.convertToResponseDto(savedInstance);
    }
    async updateFutureInstances(schedule, updateScheduleDto, instanceDate) {
        const originalEndDate = schedule.repeatEndDate;
        const newSchedule = new schedule_entity_1.Schedule();
        Object.assign(newSchedule, schedule, updateScheduleDto);
        newSchedule.scheduleId = undefined;
        newSchedule.startDate = new Date(instanceDate);
        if (updateScheduleDto.startDate) {
            newSchedule.startDate.setUTCHours(updateScheduleDto.startDate.getUTCHours(), updateScheduleDto.startDate.getUTCMinutes(), 0, 0);
        }
        else {
            newSchedule.startDate.setUTCHours(schedule.startDate.getUTCHours(), schedule.startDate.getUTCMinutes(), 0, 0);
        }
        if (updateScheduleDto.endDate) {
            newSchedule.endDate = new Date(updateScheduleDto.endDate);
        }
        else {
            const duration = schedule.endDate.getTime() - schedule.startDate.getTime();
            newSchedule.endDate = new Date(newSchedule.startDate.getTime() + duration);
        }
        newSchedule.repeatEndDate = new Date(originalEndDate);
        if (updateScheduleDto.categoryId) {
            newSchedule.category = await this.getCategoryById(updateScheduleDto.categoryId);
        }
        if (instanceDate.getTime() === schedule.startDate.getTime()) {
            await this.schedulesRepository.remove(schedule);
        }
        else {
            schedule.repeatEndDate = new Date(instanceDate);
            schedule.repeatEndDate.setUTCDate(schedule.repeatEndDate.getUTCDate() - 1);
            schedule.repeatEndDate.setUTCHours(23, 59, 59, 999);
            await this.schedulesRepository.save(schedule);
        }
        const savedNewSchedule = await this.schedulesRepository.save(newSchedule);
        return this.convertToResponseDto(savedNewSchedule);
    }
    async deleteSchedule(userUuid, scheduleId, instanceDate, deleteType = 'single') {
        let schedule = await this.schedulesRepository.findOne({
            where: { scheduleId, userUuid },
        });
        let isCreator = true;
        if (!schedule) {
            const sharedSchedules = await this.findSharedGroupSchedulesByScheduleId(userUuid, scheduleId);
            schedule = sharedSchedules;
            isCreator = false;
        }
        if (!schedule) {
            throw new common_1.NotFoundException(`ID가 ${scheduleId}인 일정을 찾을 수 없습니다.`);
        }
        const targetDate = new Date(instanceDate);
        if (schedule.isRecurring) {
            if (schedule.repeatEndDate && schedule.repeatEndDate < targetDate) {
                throw new common_1.BadRequestException('삭제하려는 날짜가 반복 일정의 종료일보다 늦습니다.');
            }
            if (isCreator) {
                if (deleteType === 'future') {
                    await this.deleteFutureInstances(schedule, targetDate);
                }
                else {
                    await this.deleteSingleInstance(schedule, targetDate);
                }
            }
            else {
                await this.removeUserFromFutureGroupSchedules(userUuid, schedule);
            }
        }
        else {
            if (isCreator) {
                await this.groupScheduleRepository.delete({ schedule: { scheduleId } });
                await this.schedulesRepository.remove(schedule);
            }
            else {
                await this.groupScheduleRepository.delete({
                    schedule: { scheduleId },
                    userUuid,
                });
            }
        }
    }
    async removeUserFromFutureGroupSchedules(userUuid, schedule) {
        await this.groupScheduleRepository.delete({
            schedule: { scheduleId: schedule.scheduleId },
            userUuid,
        });
    }
    async deleteFutureInstances(schedule, targetDate) {
        const originalEndDate = schedule.repeatEndDate;
        schedule.repeatEndDate = new Date(targetDate);
        schedule.repeatEndDate.setUTCDate(schedule.repeatEndDate.getUTCDate() - 1);
        schedule.repeatEndDate.setUTCHours(23, 59, 59, 999);
        await this.schedulesRepository.save(schedule);
        return originalEndDate;
    }
    async deleteSingleInstance(schedule, targetDate) {
        const originalEndDate = await this.deleteFutureInstances(schedule, targetDate);
        const newSchedule = { ...schedule };
        newSchedule.scheduleId = undefined;
        newSchedule.startDate = this.getNextOccurrenceDate(schedule, targetDate);
        newSchedule.endDate = new Date(newSchedule.startDate.getTime() +
            (schedule.endDate.getTime() - schedule.startDate.getTime()));
        newSchedule.repeatEndDate = originalEndDate;
        await this.schedulesRepository.save(newSchedule);
    }
    async findRecurringSchedules(userUuid) {
        return this.schedulesRepository.find({
            where: { userUuid, isRecurring: true },
            relations: ['category'],
        });
    }
    async findRegularSchedulesInRange(userUuid, startDate, endDate) {
        return this.schedulesRepository.find({
            where: {
                userUuid,
                startDate: (0, typeorm_2.LessThanOrEqual)(endDate),
                endDate: (0, typeorm_2.MoreThanOrEqual)(startDate),
                isRecurring: false,
            },
            relations: ['category'],
        });
    }
    expandRecurringSchedules(schedules, startDate, endDate) {
        const expandedSchedules = [];
        for (const schedule of schedules) {
            if (schedule.repeatEndDate && schedule.repeatEndDate < startDate) {
                continue;
            }
            let currentDate = new Date(schedule.startDate);
            const scheduleEndDate = schedule.repeatEndDate || endDate;
            while (currentDate <= scheduleEndDate && currentDate <= endDate) {
                if (this.isOccurrenceDate(schedule, currentDate)) {
                    const newSchedule = this.createOccurrence(schedule, currentDate);
                    if (newSchedule.startDate <= endDate &&
                        newSchedule.endDate >= startDate) {
                        expandedSchedules.push(newSchedule);
                    }
                }
                currentDate = this.getNextOccurrenceDate(schedule, currentDate);
            }
        }
        return expandedSchedules;
    }
    isOccurrenceDate(schedule, date) {
        switch (schedule.repeatType) {
            case 'daily':
                return true;
            case 'weekly':
                return schedule.recurringDaysOfWeek.includes(date.getDay());
            case 'monthly':
                return date.getDate() === schedule.recurringDayOfMonth;
            case 'yearly':
                return (date.getMonth() === schedule.recurringMonthOfYear &&
                    date.getDate() === schedule.recurringDayOfMonth);
            default:
                return false;
        }
    }
    getNextOccurrenceDate(schedule, currentDate) {
        const nextDate = new Date(currentDate);
        const interval = schedule.recurringInterval || 1;
        switch (schedule.repeatType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + interval);
                break;
            case 'weekly':
                do {
                    nextDate.setDate(nextDate.getDate() + 1);
                } while (!schedule.recurringDaysOfWeek.includes(nextDate.getDay()));
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + interval);
                nextDate.setDate(schedule.recurringDayOfMonth);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + interval);
                nextDate.setMonth(schedule.recurringMonthOfYear);
                nextDate.setDate(schedule.recurringDayOfMonth);
                break;
        }
        return nextDate;
    }
    createOccurrence(schedule, startDate) {
        const duration = schedule.endDate.getTime() - schedule.startDate.getTime();
        const endDate = new Date(startDate.getTime() + duration);
        return {
            ...schedule,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        };
    }
    adjustDateForAllDay(startDate, endDate) {
        const adjustedStartDate = new Date(startDate);
        adjustedStartDate.setUTCHours(0, 0, 0, 0);
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setUTCHours(23, 59, 59, 999);
        return [adjustedStartDate, adjustedEndDate];
    }
    async getCategoryById(categoryId) {
        const category = await this.categoryRepository.findOne({
            where: { categoryId: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`전달받은 카테고리 ID인 ${categoryId}는 존재하지 않는 카테고리입니다.`);
        }
        return category;
    }
    async validateUser(userUuid) {
        const userExists = await this.usersService.checkUserExists(userUuid);
        if (!userExists) {
            throw new common_1.NotFoundException(`해당 UUID : ${userUuid} 를 가진 사용자는 없습니다.`);
        }
    }
    async convertToResponseDto(schedule) {
        const groupSchedules = await this.groupScheduleRepository.find({
            where: { schedule: { scheduleId: schedule.scheduleId } },
            relations: ['group', 'user'],
        });
        const groupMap = new Map();
        groupSchedules.forEach((groupSchedule) => {
            const { group, user } = groupSchedule;
            if (!groupMap.has(group.groupId)) {
                groupMap.set(group.groupId, {
                    groupId: group.groupId,
                    groupName: group.groupName,
                    users: [],
                });
            }
            groupMap.get(group.groupId).users.push({
                userUuid: user.userUuid,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileImage: user.profileImage,
            });
        });
        const groupInfo = Array.from(groupMap.values());
        return new response_schedule_dto_1.ResponseScheduleDto({
            scheduleId: schedule.scheduleId,
            userUuid: schedule.userUuid,
            category: schedule.category,
            title: schedule.title || '',
            place: schedule.place || '',
            memo: schedule.memo || '',
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            isAllDay: schedule.isAllDay,
            isRecurring: schedule.isRecurring,
            repeatType: schedule.repeatType,
            repeatEndDate: schedule.repeatEndDate,
            recurringInterval: schedule.recurringInterval,
            recurringDaysOfWeek: schedule.recurringDaysOfWeek,
            recurringDayOfMonth: schedule.recurringDayOfMonth,
            recurringMonthOfYear: schedule.recurringMonthOfYear,
            groupInfo: groupInfo.length > 0 ? groupInfo : undefined,
        });
    }
    parseGptResponse(response) {
        try {
            return JSON.parse(response);
        }
        catch (error) {
            console.error('Error parsing GPT response:', error);
            throw new Error('Failed to parse GPT response');
        }
    }
    async processWithGpt(transcriptionResult, currentDateTime) {
        const formattedDate = await this.formatDateToYYYYMMDDHHMMSS(new Date(currentDateTime));
        const gptResponse = await this.openai.chat.completions.create({
            model: this.configService.get('OPENAI_FINETUNING_MODEL'),
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that extracts startDate, endDate, title, place, isAllDay, and category information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
                },
                {
                    role: 'user',
                    content: `{Today : ${formattedDate}, conversations : ${transcriptionResult}}`,
                },
            ],
        });
        const gptResponseContent = gptResponse.choices[0].message.content;
        console.log(gptResponseContent);
        const parsedResponse = this.parseGptResponse(gptResponseContent);
        return this.convertGptResponseToCreateScheduleDto(parsedResponse);
    }
    async processWithGptOCR(OCRResult) {
        const gptResponse = await this.openai.chat.completions.create({
            model: this.configService.get('OPENAI_FINETUNING_MODEL_OCR'),
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that extracts startDate, endDate, category, intent, isAllDay and place information from conversations. 카테고리[병원, 복약, 가족, 종교, 운동, 경조사, 기타]',
                },
                {
                    role: 'user',
                    content: `${OCRResult}`,
                },
            ],
            max_tokens: 1000,
            temperature: 0,
        });
        const gptResponseContent = gptResponse.choices[0].message.content;
        return this.parseGptResponse(gptResponseContent);
    }
    async formatDateToYYYYMMDDHHMMSS(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    async convertGptResponseToCreateScheduleDto(gptEvents) {
        const allCategories = await this.categoryRepository.find();
        const categoryMap = allCategories.reduce((acc, category) => {
            acc[category.categoryName] = category.categoryId;
            return acc;
        }, {});
        console.log(gptEvents);
        return gptEvents.map((event) => {
            const dto = new create_schedule_dto_1.CreateScheduleDto();
            dto.startDate = new Date(event.startDate);
            dto.endDate = new Date(event.endDate);
            dto.title = event.intent || event.title || '새로운 일정';
            dto.place = event.place || '';
            dto.isAllDay = event.isAllDay || false;
            dto.categoryId = categoryMap[event.category] || 7;
            dto.isRecurring = false;
            return dto;
        });
    }
    async transcribeRTZRAndFetchResultWithGpt(file, currentDateTime, userUuid) {
        await this.validateUser(userUuid);
        const transcribe = await this.voiceTranscriptionService.RTZRTranscribeResult(file);
        return this.processWithGpt(transcribe, currentDateTime);
    }
    async transcribeWhisperAndFetchResultWithGpt(file, currentDateTime, userUuid) {
        await this.validateUser(userUuid);
        const transcribe = await this.voiceTranscriptionService.whisperTranscribeResult(file);
        return this.processWithGpt(transcribe, currentDateTime);
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = SchedulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(5, (0, typeorm_1.InjectRepository)(group_schedule_entity_1.GroupSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        voice_transcription_service_1.VoiceTranscriptionService,
        users_service_1.UsersService,
        typeorm_2.Repository,
        group_service_1.GroupService])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map