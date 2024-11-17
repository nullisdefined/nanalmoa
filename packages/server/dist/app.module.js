"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const schedules_module_1 = require("./modules/schedules/schedules.module");
const group_module_1 = require("./modules/group/group.module");
const dataSource_1 = require("./dataSource");
const categories_module_1 = require("./modules/categories/categories.module");
const passport_1 = require("@nestjs/passport");
const manager_controller_1 = require("./modules/manager/manager.controller");
const manager_module_1 = require("./modules/manager/manager.module");
const invitations_module_1 = require("./modules/invitations/invitations.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.${process.env.NODE_ENV}.env`,
            }),
            typeorm_1.TypeOrmModule.forRoot(dataSource_1.dataSourceOptions),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            schedules_module_1.SchedulesModule,
            group_module_1.GroupModule,
            categories_module_1.CategoriesModule,
            manager_module_1.ManagerModule,
            invitations_module_1.InvitationsModule,
        ],
        controllers: [app_controller_1.AppController, manager_controller_1.ManagerController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map