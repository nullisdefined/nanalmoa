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
exports.Auth = exports.AuthProvider = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["KAKAO"] = "kakao";
    AuthProvider["NAVER"] = "naver";
    AuthProvider["BASIC"] = "basic";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
let Auth = class Auth {
};
exports.Auth = Auth;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Auth.prototype, "authId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_uuid' }),
    __metadata("design:type", String)
], Auth.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuthProvider, name: 'auth_provider' }),
    __metadata("design:type", String)
], Auth.prototype, "authProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'oauth_id' }),
    __metadata("design:type", String)
], Auth.prototype, "oauthId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'refresh_token' }),
    __metadata("design:type", String)
], Auth.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Auth.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Auth.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.auths),
    (0, typeorm_1.JoinColumn)({ name: 'user_uuid', referencedColumnName: 'userUuid' }),
    __metadata("design:type", user_entity_1.User)
], Auth.prototype, "user", void 0);
exports.Auth = Auth = __decorate([
    (0, typeorm_1.Entity)('auth')
], Auth);
//# sourceMappingURL=auth.entity.js.map