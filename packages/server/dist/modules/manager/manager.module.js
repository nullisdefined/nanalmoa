"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerModule = void 0;
const common_1 = require("@nestjs/common");
const manager_service_1 = require("./manager.service");
const manager_controller_1 = require("./manager.controller");
const typeorm_1 = require("@nestjs/typeorm");
const manager_invitation_entity_1 = require("../../entities/manager-invitation.entity");
const manager_subordinate_entity_1 = require("../../entities/manager-subordinate.entity");
const user_entity_1 = require("../../entities/user.entity");
const users_service_1 = require("../users/users.service");
const auth_entity_1 = require("../../entities/auth.entity");
let ManagerModule = class ManagerModule {
};
exports.ManagerModule = ManagerModule;
exports.ManagerModule = ManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                manager_invitation_entity_1.ManagerInvitation,
                manager_subordinate_entity_1.ManagerSubordinate,
                user_entity_1.User,
                auth_entity_1.Auth,
            ]),
        ],
        providers: [manager_service_1.ManagerService, users_service_1.UsersService],
        controllers: [manager_controller_1.ManagerController],
        exports: [manager_service_1.ManagerService],
    })
], ManagerModule);
//# sourceMappingURL=manager.module.js.map