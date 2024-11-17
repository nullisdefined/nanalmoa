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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const auth_entity_1 = require("../entities/auth.entity");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const basic_signup_dto_1 = require("./dto/basic-signup.dto");
const basic_login_dto_1 = require("./dto/basic-login.dto");
const response_schema_1 = require("./schema/response.schema");
const verify_code_dto_1 = require("./dto/verify-code.dto");
let AuthController = class AuthController {
    constructor(authService, configService, jwtService) {
        this.authService = authService;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async naverLogin() { }
    async kakaoLogin() { }
    async handleSocialLogin(code, provider) {
        if (!code) {
            throw new common_1.UnauthorizedException('인가 코드가 없습니다.');
        }
        try {
            const socialTokens = provider === auth_entity_1.AuthProvider.NAVER
                ? await this.authService.getNaverToken(code)
                : await this.authService.getKakaoToken(code);
            const socialUser = provider === auth_entity_1.AuthProvider.NAVER
                ? await this.authService.getNaverUserInfo(socialTokens.access_token)
                : await this.authService.getKakaoUserInfo(socialTokens.access_token);
            const user = await this.authService.findOrCreateSocialUser(socialUser, socialTokens.refresh_token, provider);
            const accessToken = this.authService.generateAccessToken(user, provider);
            return {
                accessToken,
                refreshToken: socialTokens.refresh_token,
            };
        }
        catch (error) {
            console.error(`${provider} login error:`, error);
            throw new common_1.UnauthorizedException(`${provider} 로그인 실패`);
        }
    }
    async naverLoginCallback(code) {
        return this.handleSocialLogin(code, auth_entity_1.AuthProvider.NAVER);
    }
    async kakaoLoginCallback(code) {
        return this.handleSocialLogin(code, auth_entity_1.AuthProvider.KAKAO);
    }
    async sendVerificationCode(phoneNumber) {
        const result = await this.authService.sendVerificationCode(phoneNumber);
        if (!result) {
            throw new common_1.InternalServerErrorException('인증 코드 전송에 실패했습니다');
        }
        return { message: '인증 코드 전송 성공' };
    }
    verifyCode(verifyCodeDto) {
        const { phoneNumber, code } = verifyCodeDto;
        return this.authService.verifyCode(phoneNumber, code);
    }
    async signup(signupDto) {
        const { phoneNumber, verificationCode, name, email, profileImage, address, } = signupDto;
        await this.authService.verifyCode(phoneNumber, verificationCode);
        this.authService.invalidateVerificationCode(phoneNumber);
        return await this.authService.signupWithPhoneNumber(phoneNumber, name, email, profileImage, address);
    }
    async login(loginDto) {
        const { phoneNumber, verificationCode } = loginDto;
        await this.authService.verifyCode(phoneNumber, verificationCode);
        const user = await this.authService.validateUserByPhoneNumber(phoneNumber);
        const tokens = await this.authService.loginWithPhoneNumber(user);
        return {
            ...tokens,
        };
    }
    async refreshToken(req, refreshTokenDto) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw new common_1.BadRequestException('인증 토큰이 없습니다.');
            }
            const [, token] = authHeader.split(' ');
            const decodedToken = this.jwtService.decode(token);
            if (!decodedToken || typeof decodedToken === 'string') {
                throw new common_1.BadRequestException('유효하지 않은 토큰 형식입니다.');
            }
            const { sub: userUuid, socialProvider } = decodedToken;
            try {
                this.jwtService.verify(token);
            }
            catch (error) {
                if (error.name !== 'TokenExpiredError') {
                    throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다.');
                }
            }
            const newTokens = await this.authService.refreshAccessToken(userUuid, refreshTokenDto.refreshToken, socialProvider);
            return newTokens;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('액세스 토큰 갱신 실패');
        }
    }
    async sendEmailVerification(email) {
        return this.authService.sendEmailVerification(email);
    }
    async verifyEmailCode(email, code) {
        return this.authService.verifyEmailCode(email, code);
    }
    async getAccessToken(name, phoneNumber) {
        const tokens = await this.authService.signupTemporaryUser(phoneNumber, name);
        return tokens;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('naver'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('naver')),
    (0, swagger_1.ApiOperation)({ summary: '백엔드에서 네이버 로그인' }),
    (0, swagger_1.ApiResponse)({
        status: 302,
        description: '네이버 로그인 페이지로 리다이렉트',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "naverLogin", null);
__decorate([
    (0, common_1.Get)('kakao'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('kakao')),
    (0, swagger_1.ApiOperation)({ summary: '백엔드에서 카카오 로그인' }),
    (0, swagger_1.ApiResponse)({
        status: 302,
        description: '카카오 로그인 페이지로 리다이렉트',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "kakaoLogin", null);
__decorate([
    (0, common_1.Get)('naver/callback'),
    (0, swagger_1.ApiOperation)({ summary: '네이버 로그인 콜백' }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        required: true,
        type: String,
        description: '네이버 인가 코드',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'state',
        required: true,
        type: String,
        description: '상태 값',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '네이버 로그인 인증 성공',
        schema: response_schema_1.NaverLoginResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '인증 실패',
    }),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "naverLoginCallback", null);
__decorate([
    (0, common_1.Get)('kakao/callback'),
    (0, swagger_1.ApiOperation)({ summary: '카카오 로그인 콜백' }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        required: true,
        type: String,
        description: '카카오 인가 코드',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '카카오 로그인 인증 성공',
        schema: response_schema_1.KakaoLoginResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '인증 실패',
    }),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "kakaoLoginCallback", null);
__decorate([
    (0, common_1.Post)('sms/send'),
    (0, swagger_1.ApiOperation)({ summary: 'SMS 인증 코드 전송' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string',
                    description: '인증 코드를 받을 전화번호',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인증 코드 전송 성공',
        schema: response_schema_1.SendVerificationCodeResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '인증 코드 전송 실패',
        schema: response_schema_1.SendVerificationCodeErrorSchema,
    }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerificationCode", null);
__decorate([
    (0, common_1.Post)('sms/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'SMS 인증 코드 확인' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인증 성공',
        schema: response_schema_1.VerifyCodeResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '유효하지 않은 인증 코드',
        schema: response_schema_1.VerifyCodeErrorSchema,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_code_dto_1.VerifyCodeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Post)('basic/signup'),
    (0, swagger_1.ApiOperation)({ summary: '일반 회원가입' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '회원가입 성공 및 로그인 상태(토큰 발행)',
        schema: response_schema_1.BasicSignupResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 실패' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [basic_signup_dto_1.BasicSignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('basic/login'),
    (0, swagger_1.ApiOperation)({ summary: '일반 로그인' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '로그인 성공',
        schema: response_schema_1.BasicLoginResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 실패' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [basic_login_dto_1.BasicLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: '액세스 토큰 갱신' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '토큰 갱신 성공, 리프레시 토큰은 옵셔널',
        schema: response_schema_1.RefreshAccessTokenResponseSchema,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '인증 실패',
        schema: response_schema_1.RefreshTokenErrorSchema,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('email/send'),
    (0, swagger_1.ApiOperation)({ summary: '이메일 인증 코드 전송' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    description: '인증 코드를 받을 이메일 주소',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인증 코드 전송 성공',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '인증 코드가 이메일로 전송되었습니다.',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 이메일 형식',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: '잘못된 이메일 형식입니다.' },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendEmailVerification", null);
__decorate([
    (0, common_1.Post)('email/verify'),
    (0, swagger_1.ApiOperation)({ summary: '이메일 인증 코드 확인' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    description: '인증 코드를 받은 이메일 주소',
                },
                code: {
                    type: 'string',
                    description: '이메일로 받은 인증 코드',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인증 성공',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '이메일이 성공적으로 인증되었습니다.',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 인증 코드',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: '잘못된 인증 코드입니다.' },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    }),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailCode", null);
__decorate([
    (0, common_1.Post)('token/temporary'),
    (0, swagger_1.ApiOperation)({ summary: '임시 액세스 토큰 발급' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: '사용자 이름',
                },
                phoneNumber: {
                    type: 'string',
                    description: '사용자 전화번호',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '액세스 토큰 발급 성공',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAccessToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map