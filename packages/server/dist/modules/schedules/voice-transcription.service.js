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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VoiceTranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceTranscriptionService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const jwt = __importStar(require("jsonwebtoken"));
const form_data_1 = __importDefault(require("form-data"));
const openai_1 = __importDefault(require("openai"));
let VoiceTranscriptionService = VoiceTranscriptionService_1 = class VoiceTranscriptionService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(VoiceTranscriptionService_1.name);
        const openaiApiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({
            apiKey: openaiApiKey,
        });
    }
    isRTZRTokenExpiredOrCloseToExpiry(token, thresholdMinutes = 5) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - currentTime;
            const thresholdSeconds = thresholdMinutes * 60;
            return timeUntilExpiry <= thresholdSeconds;
        }
        catch (error) {
            console.error('토큰 검증 중 오류 발생:', error);
            return true;
        }
    }
    async getRTZRJwtToken() {
        const clientId = this.configService.get('RETURN_ZERO_CLIENT_ID');
        const clientSecret = this.configService.get('RETURN_ZERO_CLIENT_SECRET');
        const url = 'https://openapi.vito.ai/v1/authenticate';
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, `client_id=${clientId}&client_secret=${clientSecret}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            return response.data.access_token;
        }
        catch (error) {
            throw new Error(`JWT 토큰 발급 실패: ${error.message}`);
        }
    }
    async ensureValidToken() {
        const currentToken = this.configService.get('RETURN_ZERO_ACCESS_TOKEN');
        if (this.isRTZRTokenExpiredOrCloseToExpiry(currentToken)) {
            const newToken = await this.getRTZRJwtToken();
            this.configService.set('RETURN_ZERO_ACCESS_TOKEN', newToken);
            return newToken;
        }
        return currentToken;
    }
    async transcribeAudio(file) {
        const jwtToken = await this.ensureValidToken();
        const formData = new form_data_1.default();
        formData.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });
        formData.append('config', JSON.stringify({
            use_diarization: true,
            use_itn: true,
            use_disfluency_filter: false,
            use_profanity_filter: false,
            use_paragraph_splitter: true,
            paragraph_splitter: { max: 50 },
            keywords: ['내일', '모레', '글피', '내년', '올해', '오늘'],
        }));
        const url = 'https://openapi.vito.ai/v1/transcribe';
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, formData, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    ...formData.getHeaders(),
                },
            }));
            return response.data.id;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('토큰이 만료되었습니다. 재발급 후 다시 시도 중...');
                await this.ensureValidToken();
                return this.transcribeAudio(file);
            }
            throw new Error(`STT 요청 실패: ${error.message}`);
        }
    }
    async getRTZRTranscriptionResult(transcribeId) {
        const jwtToken = await this.ensureValidToken();
        const url = `https://openapi.vito.ai/v1/transcribe/${transcribeId}`;
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('토큰이 만료되었습니다. 재발급 후 다시 시도 중...');
                await this.ensureValidToken();
                return this.getRTZRTranscriptionResult(transcribeId);
            }
            throw new Error(`전사 결과 조회 실패: ${error.message}`);
        }
    }
    async pollTranscriptionResult(transcribeId, maxRetries = 15, interval = 1000) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                let result = await this.getRTZRTranscriptionResult(transcribeId);
                if (result.status === 'completed') {
                    result = result.results.utterances.map((u) => u.msg).join(' ');
                    return result;
                }
            }
            catch (error) {
                console.error(`시도 ${attempt + 1} failed:`, error);
                if (attempt === maxRetries - 1) {
                    throw error;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
        throw new Error('전사 결과를 완료할 수 없습니다. 시간이 초과되었습니다.');
    }
    async RTZRTranscribeResult(file) {
        const start = Date.now();
        try {
            const transcribeId = await this.transcribeAudio(file);
            const result = await this.pollTranscriptionResult(transcribeId);
            const end = Date.now();
            this.logger.log(`RTZRTranscribeResult 실행 시간: ${end - start}ms`);
            console.log(`RTZR 전사 결과 : ${result}`);
            return result;
        }
        catch (error) {
            this.logger.error('RTZRTranscribeResult 오류:', error);
            throw error;
        }
    }
    async whisperTranscribeResult(file) {
        const start = Date.now();
        try {
            const transcription = await this.openai.audio.transcriptions.create({
                file: new File([file.buffer], file.originalname, {
                    type: file.mimetype,
                }),
                model: 'whisper-1',
            });
            const end = Date.now();
            this.logger.log(`whisperTranscribeResult 실행 시간: ${end - start}ms`);
            console.log(`Whisper 전사 결과 : ${transcription.text}`);
            return transcription.text;
        }
        catch (error) {
            this.logger.error('whisperTranscribeResult 오류:', error);
            throw new Error('음성 전사 중 오류가 발생했습니다.');
        }
    }
};
exports.VoiceTranscriptionService = VoiceTranscriptionService;
exports.VoiceTranscriptionService = VoiceTranscriptionService = VoiceTranscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], VoiceTranscriptionService);
//# sourceMappingURL=voice-transcription.service.js.map