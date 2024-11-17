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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = __importDefault(require("axios"));
const auth_entity_1 = require("../entities/auth.entity");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const coolsms_service_1 = require("./coolsms.service");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let AuthService = class AuthService {
    constructor(configService, jwtService, authRepository, userRepository, coolSmsService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.authRepository = authRepository;
        this.userRepository = userRepository;
        this.coolSmsService = coolSmsService;
        this.verificationCodes = new Map();
        this.emailVerificationCodes = new Map();
        this.verifiedPhoneNumbers = new Map();
        this.verifiedEmails = new Map();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    setPhoneNumberVerified(phoneNumber) {
        this.verifiedPhoneNumbers.set(phoneNumber, new Date());
    }
    setEmailVerified(email) {
        this.verifiedEmails.set(email, new Date());
    }
    isPhoneNumberVerified(phoneNumber) {
        const verifiedAt = this.verifiedPhoneNumbers.get(phoneNumber);
        if (!verifiedAt)
            return false;
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        return verifiedAt > tenMinutesAgo;
    }
    isEmailVerified(email) {
        return this.isVerified(this.verifiedEmails, email);
    }
    isVerified(verificationMap, key) {
        const verifiedAt = verificationMap.get(key);
        if (!verifiedAt) {
            return false;
        }
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (verifiedAt > tenMinutesAgo) {
            return true;
        }
        verificationMap.delete(key);
        return false;
    }
    async signupWithPhoneNumber(phoneNumber, name, email, profileImage, address) {
        if (!this.isPhoneNumberVerified(phoneNumber)) {
            throw new common_1.BadRequestException('전화번호 인증이 필요합니다.');
        }
        const existingUser = await this.userRepository.findOne({
            where: { phoneNumber },
        });
        if (existingUser) {
            throw new common_1.ConflictException('이미 존재하는 전화번호입니다.');
        }
        const newUser = this.userRepository.create({
            userUuid: (0, uuid_1.v4)(),
            phoneNumber,
            name,
            email,
            profileImage,
            address,
        });
        await this.userRepository.save(newUser);
        const newAuth = this.authRepository.create({
            userUuid: newUser.userUuid,
            authProvider: auth_entity_1.AuthProvider.BASIC,
        });
        await this.authRepository.save(newAuth);
        this.verifiedPhoneNumbers.delete(phoneNumber);
        const { accessToken, refreshToken } = await this.loginWithPhoneNumber(newUser);
        return {
            accessToken,
            refreshToken,
        };
    }
    async signupTemporaryUser(phoneNumber, name) {
        let user = await this.userRepository.findOne({ where: { phoneNumber } });
        if (!user) {
            user = this.userRepository.create({
                userUuid: (0, uuid_1.v4)(),
                phoneNumber,
                name: name || '임시 사용자',
            });
            await this.userRepository.save(user);
            const tempAuth = this.authRepository.create({
                userUuid: user.userUuid,
                authProvider: auth_entity_1.AuthProvider.BASIC,
            });
            await this.authRepository.save(tempAuth);
        }
        const payload = {
            sub: user.userUuid,
            socialProvider: auth_entity_1.AuthProvider.BASIC,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '14d' });
        const auth = await this.authRepository.findOne({
            where: { userUuid: user.userUuid, authProvider: auth_entity_1.AuthProvider.BASIC },
        });
        auth.refreshToken = refreshToken;
        await this.authRepository.save(auth);
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUserByPhoneNumber(phoneNumber) {
        const user = await this.userRepository.findOne({ where: { phoneNumber } });
        if (!user) {
            throw new common_1.UnauthorizedException('등록되지 않은 전화번호입니다.');
        }
        return user;
    }
    async loginWithPhoneNumber(user) {
        const payload = { sub: user.userUuid, socialProvider: auth_entity_1.AuthProvider.BASIC };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_BASIC_REFRESH_EXPIRATION'),
        });
        const auth = await this.authRepository.findOne({
            where: {
                userUuid: user.userUuid,
                authProvider: auth_entity_1.AuthProvider.BASIC,
            },
        });
        auth.refreshToken = refreshToken;
        await this.authRepository.save(auth);
        return { accessToken, refreshToken };
    }
    generateVerificationCode() {
        return Math.random().toString().slice(2, 8);
    }
    async sendVerificationCode(phoneNumber) {
        const now = new Date();
        const storedData = this.verificationCodes.get(phoneNumber);
        if (storedData &&
            now.getTime() - storedData.expiresAt.getTime() < -4 * 60 * 1000) {
            throw new common_1.BadRequestException('1분 후에 다시 시도해주세요.');
        }
        const verificationCode = this.generateVerificationCode();
        const expirationMinutes = 5;
        const expiresAt = new Date(now.getTime() + expirationMinutes * 60000);
        this.verificationCodes.set(phoneNumber, {
            code: verificationCode,
            expiresAt,
            isVerified: false,
        });
        try {
            const result = await this.coolSmsService.sendVerificationCode(phoneNumber, verificationCode, expirationMinutes);
            return result;
        }
        catch (error) {
            console.error('인증 코드 전송 실패:', error);
            this.verificationCodes.delete(phoneNumber);
            return false;
        }
    }
    async verifyCode(phoneNumber, code) {
        const storedData = this.verificationCodes.get(phoneNumber);
        if (!storedData) {
            throw new common_1.UnauthorizedException('유효하지 않은 인증 코드입니다.');
        }
        if (storedData.code !== code) {
            throw new common_1.UnauthorizedException('유효하지 않은 인증 코드입니다.');
        }
        if (new Date() > storedData.expiresAt) {
            throw new common_1.UnauthorizedException('유효하지 않은 인증 코드입니다.');
        }
        this.setPhoneNumberVerified(phoneNumber);
        this.verificationCodes.set(phoneNumber, {
            ...storedData,
            isVerified: true,
        });
    }
    invalidateVerificationCode(phoneNumber) {
        this.verificationCodes.delete(phoneNumber);
    }
    async refreshBasicToken(user) {
        const accessToken = this.generateAccessToken(user, auth_entity_1.AuthProvider.BASIC);
        const refreshToken = this.jwtService.sign({ sub: user.userUuid, phoneNumber: user.phoneNumber }, {
            expiresIn: this.configService.get('JWT_BASIC_REFRESH_EXPIRATION'),
        });
        return { accessToken, refreshToken };
    }
    async getNaverToken(code) {
        const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
        const params = {
            grant_type: 'authorization_code',
            client_id: this.configService.get('NAVER_CLIENT_ID'),
            client_secret: this.configService.get('NAVER_CLIENT_SECRET'),
            redirect_uri: this.configService.get('NAVER_REDIRECT_URI'),
            code,
        };
        try {
            const response = await axios_1.default.post(tokenUrl, null, { params });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('네이버 토큰 획득에 실패했습니다.');
        }
    }
    async getNaverUserInfo(accessToken) {
        const userInfoUrl = 'https://openapi.naver.com/v1/nid/me';
        try {
            const response = await axios_1.default.get(userInfoUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data.response;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('네이버 사용자 정보 획득에 실패했습니다.');
        }
    }
    async refreshNaverToken(refreshToken) {
        const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
        const params = {
            grant_type: 'refresh_token',
            client_id: this.configService.get('NAVER_CLIENT_ID'),
            client_secret: this.configService.get('NAVER_CLIENT_SECRET'),
            refresh_token: refreshToken,
        };
        try {
            const response = await axios_1.default.post(tokenUrl, null, { params });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('네이버 토큰 갱신에 실패했습니다.');
        }
    }
    async getKakaoToken(code) {
        const tokenUrl = 'https://kauth.kakao.com/oauth/token';
        const params = {
            grant_type: 'authorization_code',
            client_id: this.configService.get('KAKAO_CLIENT_ID'),
            client_secret: this.configService.get('KAKAO_CLIENT_SECRET'),
            redirect_uri: this.configService.get('KAKAO_REDIRECT_URI'),
            code,
        };
        try {
            const response = await axios_1.default.post(tokenUrl, null, { params });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('카카오 토큰 획득에 실패했습니다.');
        }
    }
    async getKakaoUserInfo(accessToken) {
        const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
        try {
            const response = await axios_1.default.get(userInfoUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('카카오 사용자 정보 획득에 실패했습니다.');
        }
    }
    async refreshKakaoToken(refreshToken) {
        const tokenUrl = 'https://kauth.kakao.com/oauth/token';
        const params = {
            grant_type: 'refresh_token',
            client_id: this.configService.get('KAKAO_CLIENT_ID'),
            client_secret: this.configService.get('KAKAO_CLIENT_SECRET'),
            refresh_token: refreshToken,
        };
        try {
            const response = await axios_1.default.post(tokenUrl, null, { params });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('카카오 토큰 갱신에 실패했습니다.');
        }
    }
    async findOrCreateSocialUser(socialUser, refreshToken, provider) {
        let oauthId, name, email, profileImage;
        if (provider === auth_entity_1.AuthProvider.KAKAO) {
            oauthId = socialUser.id.toString();
            name = socialUser.properties?.nickname;
            email = socialUser.kakao_account?.email;
            profileImage = socialUser.properties?.profile_image;
        }
        else if (provider === auth_entity_1.AuthProvider.NAVER) {
            oauthId = socialUser.id;
            name = socialUser.name;
            email = socialUser.email;
            profileImage = socialUser.profile_image;
        }
        else {
            throw new common_1.UnauthorizedException('지원하지 않는 소셜 프로바이더입니다.');
        }
        let auth = await this.authRepository.findOne({
            where: {
                oauthId: oauthId,
                authProvider: provider,
            },
            relations: ['user'],
        });
        if (auth) {
            auth.refreshToken = refreshToken;
            await this.authRepository.save(auth);
            return auth.user;
        }
        else {
            const newUser = this.userRepository.create({
                userUuid: (0, uuid_1.v4)(),
                name,
                profileImage,
                email,
            });
            await this.userRepository.save(newUser);
            const newAuth = this.authRepository.create({
                user: newUser,
                userUuid: newUser.userUuid,
                oauthId: oauthId,
                authProvider: provider,
                refreshToken: refreshToken,
            });
            await this.authRepository.save(newAuth);
            return newUser;
        }
    }
    async findUserBySocialId(oauthId, provider) {
        const auth = await this.authRepository.findOne({
            where: {
                oauthId,
                authProvider: provider,
            },
            relations: ['user'],
        });
        return auth ? auth.user : null;
    }
    async createSocialUser(socialUser, refreshToken, provider) {
        const newUser = this.userRepository.create({
            userUuid: (0, uuid_1.v4)(),
            name: socialUser.name,
            email: socialUser.email,
            profileImage: socialUser.profileImage,
        });
        await this.userRepository.save(newUser);
        const newAuth = this.authRepository.create({
            user: newUser,
            userUuid: newUser.userUuid,
            oauthId: socialUser.id,
            authProvider: provider,
            refreshToken: refreshToken,
        });
        await this.authRepository.save(newAuth);
        return newUser;
    }
    generateAccessToken(user, socialProvider) {
        const payload = {
            sub: user.userUuid,
            socialProvider: socialProvider,
        };
        return this.jwtService.sign(payload);
    }
    async refreshAccessToken(userUuid, refreshToken, socialProvider) {
        const user = await this.userRepository.findOne({
            where: { userUuid },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('사용자를 찾을 수 없습니다.');
        }
        const auth = await this.authRepository.findOne({
            where: { userUuid, authProvider: socialProvider },
        });
        if (!auth || auth.refreshToken !== refreshToken) {
            throw new common_1.UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
        }
        try {
            let newTokens;
            switch (socialProvider) {
                case auth_entity_1.AuthProvider.BASIC:
                    newTokens = await this.refreshBasicToken(user);
                    break;
                case auth_entity_1.AuthProvider.NAVER:
                    newTokens = await this.refreshNaverToken(refreshToken);
                    break;
                case auth_entity_1.AuthProvider.KAKAO:
                    newTokens = await this.refreshKakaoToken(refreshToken);
                    break;
                default:
                    throw new common_1.UnauthorizedException('지원하지 않는 소셜 프로바이더입니다.');
            }
            const accessToken = this.generateAccessToken(user, socialProvider);
            if (newTokens.refresh_token) {
                auth.refreshToken = newTokens.refresh_token;
                await this.authRepository.save(auth);
            }
            return {
                accessToken,
                refreshToken: newTokens.refresh_token,
            };
        }
        catch (error) {
            await this.authRepository.update(auth.authId, { refreshToken: null });
            throw new common_1.UnauthorizedException('토큰 갱신에 실패했습니다.');
        }
    }
    async sendEmailVerification(email) {
        if (!this.isValidEmail(email)) {
            throw new common_1.BadRequestException('잘못된 이메일 형식입니다.');
        }
        const now = new Date();
        const storedData = this.emailVerificationCodes.get(email);
        if (storedData &&
            now.getTime() - storedData.expiresAt.getTime() < -4 * 60 * 1000) {
            throw new common_1.BadRequestException('1분 후에 다시 시도해주세요.');
        }
        const verificationCode = this.generateVerificationCode();
        const expirationMinutes = 5;
        const expiresAt = new Date(now.getTime() + expirationMinutes * 60000);
        this.emailVerificationCodes.set(email, {
            code: verificationCode,
            expiresAt,
        });
        const templatePath = path.join(process.cwd(), 'templates', 'email-verification.html');
        let htmlContent;
        try {
            htmlContent = fs.readFileSync(templatePath, 'utf8');
        }
        catch (error) {
            console.error('템플릿 파일을 읽을 수 없습니다:', error);
            throw new common_1.BadRequestException('이메일 템플릿을 로드할 수 없습니다.');
        }
        htmlContent = htmlContent.replace('{{verificationCode}}', verificationCode);
        htmlContent = htmlContent.replace('{{expirationMinutes}}', expirationMinutes.toString());
        try {
            await this.sendEmail(email, '[나날모아] 이메일 인증', htmlContent);
            return { message: '인증 코드가 이메일로 전송되었습니다.' };
        }
        catch (error) {
            console.error('이메일 전송 실패:', error);
            this.emailVerificationCodes.delete(email);
            throw new common_1.BadRequestException('이메일 전송에 실패했습니다.');
        }
    }
    async verifyEmailCode(email, code) {
        const storedData = this.emailVerificationCodes.get(email);
        if (!storedData) {
            console.log('저장된 이메일 인증 코드가 없습니다.');
            return false;
        }
        if (storedData.code !== code) {
            console.log('잘못된 이메일 인증 코드입니다.');
            return false;
        }
        if (new Date() > storedData.expiresAt) {
            console.log('이메일 인증 코드가 만료되었습니다.');
            this.emailVerificationCodes.delete(email);
            return false;
        }
        this.setEmailVerified(email);
        this.emailVerificationCodes.delete(email);
        return true;
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async sendEmail(to, subject, html) {
        await this.transporter.sendMail({
            from: this.configService.get('EMAIL_FROM'),
            to,
            subject,
            html,
        });
    }
    async revokeSocialConnection(userUuid, accessToken, provider) {
        try {
            switch (provider) {
                case auth_entity_1.AuthProvider.KAKAO:
                    await this.revokeKakaoConnection(userUuid);
                    break;
                case auth_entity_1.AuthProvider.NAVER:
                    await this.revokeNaverConnection(accessToken);
                    break;
                default:
                    throw new Error(`${provider}는 지원하지 않는 소셜 프로바이더입니다.`);
            }
        }
        catch (error) {
            console.error(`${provider} unlink 오류`, error);
            throw new common_1.InternalServerErrorException(`${provider} 연결 해제 실패: ${error.message}`);
        }
    }
    async revokeKakaoConnection(userUuid) {
        const clientId = this.configService.get('KAKAO_ADMIN');
        if (!clientId) {
            throw new Error('KAKAO_CLIENT_ID가 설정되지 않았습니다.');
        }
        try {
            const auth = await this.authRepository.findOne({
                where: {
                    userUuid,
                    authProvider: auth_entity_1.AuthProvider.KAKAO,
                },
            });
            if (!auth || !auth.oauthId) {
                throw new Error('카카오 연동 정보를 찾을 수 없습니다.');
            }
            await axios_1.default.post('https://kapi.kakao.com/v1/user/unlink', {}, {
                headers: {
                    Authorization: `KakaoAK ${clientId}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    target_id_type: 'user_id',
                    target_id: auth.oauthId,
                },
            });
            await this.authRepository.remove(auth);
        }
        catch (error) {
            console.error('카카오 연결 해제 오류:', error.response?.data || error.message);
            throw error;
        }
    }
    async revokeNaverConnection(accessToken) {
        const clientId = this.configService.get('NAVER_CLIENT_ID');
        const clientSecret = this.configService.get('NAVER_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
            throw new Error('NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다');
        }
        try {
            await axios_1.default.get('https://nid.naver.com/oauth2.0/token', {
                params: {
                    grant_type: 'delete',
                    client_id: clientId,
                    client_secret: clientSecret,
                    access_token: accessToken,
                    service_provider: 'NAVER',
                },
            });
        }
        catch (error) {
            console.error('네이버 연결 해제 오류:', error.response?.data || error.message);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(auth_entity_1.Auth)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        coolsms_service_1.CoolSmsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map