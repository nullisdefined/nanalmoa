"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const auth_entity_1 = require("./entities/auth.entity");
const user_entity_1 = require("./entities/user.entity");
const category_entity_1 = require("./entities/category.entity");
const schedule_entity_1 = require("./entities/schedule.entity");
const category_seed_1 = require("./database/seeds/category.seed");
const manager_invitation_entity_1 = require("./entities/manager-invitation.entity");
const manager_subordinate_entity_1 = require("./entities/manager-subordinate.entity");
const group_entity_1 = require("./entities/group.entity");
const group_invitation_entity_1 = require("./entities/group-invitation.entity");
const group_schedule_entity_1 = require("./entities/group-schedule.entity");
const user_group_entity_1 = require("./entities/user-group.entity");
const user_routine_entity_1 = require("./entities/user-routine.entity");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, `../.${process.env.NODE_ENV}.env`) });
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        auth_entity_1.Auth,
        user_entity_1.User,
        category_entity_1.Category,
        schedule_entity_1.Schedule,
        manager_invitation_entity_1.ManagerInvitation,
        manager_subordinate_entity_1.ManagerSubordinate,
        group_entity_1.Group,
        group_invitation_entity_1.GroupInvitation,
        group_schedule_entity_1.GroupSchedule,
        user_group_entity_1.UserGroup,
        user_routine_entity_1.UserRoutine,
    ],
    migrations: [(0, path_1.resolve)(__dirname, 'migrations', '*.{js,ts}')],
    seeds: [category_seed_1.CategorySeeder],
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    synchronize: process.env.NODE_ENV === 'production' ? false : true,
};
exports.dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
//# sourceMappingURL=dataSource.js.map