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
exports.ManagerSubordinate = void 0;
const typeorm_1 = require("typeorm");
let ManagerSubordinate = class ManagerSubordinate {
};
exports.ManagerSubordinate = ManagerSubordinate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_manager_id' }),
    __metadata("design:type", Number)
], ManagerSubordinate.prototype, "userManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'manager_uuid' }),
    __metadata("design:type", String)
], ManagerSubordinate.prototype, "managerUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'subordinate_uuid' }),
    __metadata("design:type", String)
], ManagerSubordinate.prototype, "subordinateUuid", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ManagerSubordinate.prototype, "createdAt", void 0);
exports.ManagerSubordinate = ManagerSubordinate = __decorate([
    (0, typeorm_1.Entity)('manager_subordinate')
], ManagerSubordinate);
//# sourceMappingURL=manager-subordinate.entity.js.map