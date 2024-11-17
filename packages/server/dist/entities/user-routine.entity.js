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
exports.UserRoutine = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserRoutine = class UserRoutine {
};
exports.UserRoutine = UserRoutine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_routine_id' }),
    __metadata("design:type", Number)
], UserRoutine.prototype, "userRoutineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_uuid' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wake_up_time', type: 'time' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "wakeUpTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'breakfast_time', type: 'time' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "breakfastTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lunch_time', type: 'time' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "lunchTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dinner_time', type: 'time' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "dinnerTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bed_time', type: 'time' }),
    __metadata("design:type", String)
], UserRoutine.prototype, "bedTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserRoutine.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], UserRoutine.prototype, "user", void 0);
exports.UserRoutine = UserRoutine = __decorate([
    (0, typeorm_1.Entity)('user_routine')
], UserRoutine);
//# sourceMappingURL=user-routine.entity.js.map