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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGroup = void 0;
const typeorm_1 = require("typeorm");
const group_entity_1 = require("./group.entity");
let UserGroup = class UserGroup {
};
exports.UserGroup = UserGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_group_id' }),
    __metadata("design:type", Number)
], UserGroup.prototype, "userGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_uuid' }),
    __metadata("design:type", String)
], UserGroup.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group, (group) => group.userGroups),
    (0, typeorm_1.JoinColumn)({ name: 'group_id' }),
    __metadata("design:type", group_entity_1.Group)
], UserGroup.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_admin' }),
    __metadata("design:type", Boolean)
], UserGroup.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserGroup.prototype, "updatedAt", void 0);
exports.UserGroup = UserGroup = __decorate([
    (0, typeorm_1.Entity)('user_group')
], UserGroup);
//# sourceMappingURL=user-group.entity.js.map