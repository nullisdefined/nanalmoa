import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BasicSignupDto } from './dto/basic-signup.dto';
import { BasicLoginDto } from './dto/basic-login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly jwtService;
    constructor(authService: AuthService, configService: ConfigService, jwtService: JwtService);
    naverLogin(): Promise<void>;
    kakaoLogin(): Promise<void>;
    private handleSocialLogin;
    naverLoginCallback(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    kakaoLoginCallback(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    sendVerificationCode(phoneNumber: string): Promise<{
        message: string;
    }>;
    verifyCode(verifyCodeDto: VerifyCodeDto): Promise<void>;
    signup(signupDto: BasicSignupDto): Promise<import("./dto/response.dto").BasicSignupResponseDto>;
    login(loginDto: BasicLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(req: any, refreshTokenDto: RefreshTokenDto): Promise<import("./dto/response.dto").RefreshAccessTokenResponseDto>;
    sendEmailVerification(email: string): Promise<{
        message: string;
    }>;
    verifyEmailCode(email: string, code: string): Promise<boolean>;
    getAccessToken(name: string, phoneNumber: string): Promise<import("./dto/response.dto").BasicSignupResponseDto>;
}
