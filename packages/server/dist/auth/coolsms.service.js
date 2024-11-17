"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolSmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const coolsms = __importStar(require("coolsms-node-sdk"));
let CoolSmsService = class CoolSmsService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('COOLSMS_API_KEY');
        const apiSecret = this.configService.get('COOLSMS_API_SECRET');
        this.messageService = new coolsms.default(apiKey, apiSecret);
    }
    async sendVerificationCode(phoneNumber, verificationCode, expirationMinutes) {
        try {
            const result = await this.messageService.sendOne({
                to: phoneNumber,
                from: this.configService.get('COOLSMS_SENDER_PHONE_NUMBER'),
                text: `[나날모아] 본인확인 인증 코드
[${verificationCode}]를 화면에 입력해주세요.
이 코드는 ${expirationMinutes}분동안 유효합니다.`,
            });
            console.log('SMS send result:', result);
            return result.statusCode === '2000';
        }
        catch (error) {
            console.error('인증번호 전송 실패:', error);
            return false;
        }
    }
};
exports.CoolSmsService = CoolSmsService;
exports.CoolSmsService = CoolSmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CoolSmsService);
//# sourceMappingURL=coolsms.service.js.map