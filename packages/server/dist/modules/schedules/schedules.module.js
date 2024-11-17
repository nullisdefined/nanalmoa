"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesModule = void 0;
const common_1 = require("@nestjs/common");
const schedules_service_1 = require("./schedules.service");
const schedules_controller_1 = require("./schedules.controller");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_entity_1 = require("../../entities/schedule.entity");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const categories_module_1 = require("../categories/categories.module");
const voice_transcription_service_1 = require("./voice-transcription.service");
const OCR_transcription_service_1 = require("./OCR-transcription.service");
const user_entity_1 = require("../../entities/user.entity");
const users_service_1 = require("../users/users.service");
const auth_entity_1 = require("../../entities/auth.entity");
const users_module_1 = require("../users/users.module");
const manager_module_1 = require("../manager/manager.module");
const group_module_1 = require("../group/group.module");
const group_schedule_entity_1 = require("../../entities/group-schedule.entity");
let SchedulesModule = class SchedulesModule {
};
exports.SchedulesModule = SchedulesModule;
exports.SchedulesModule = SchedulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_entity_1.Schedule, user_entity_1.User, auth_entity_1.Auth, group_schedule_entity_1.GroupSchedule]),
            axios_1.HttpModule,
            config_1.ConfigModule,
            categories_module_1.CategoriesModule,
            users_module_1.UsersModule,
            manager_module_1.ManagerModule,
            group_module_1.GroupModule,
        ],
        controllers: [schedules_controller_1.SchedulesController],
        providers: [
            schedules_service_1.SchedulesService,
            voice_transcription_service_1.VoiceTranscriptionService,
            OCR_transcription_service_1.OCRTranscriptionService,
            users_service_1.UsersService,
        ],
    })
], SchedulesModule);
//# sourceMappingURL=schedules.module.js.map