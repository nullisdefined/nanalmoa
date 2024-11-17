import { User } from './user.entity';
export declare enum AuthProvider {
    KAKAO = "kakao",
    NAVER = "naver",
    BASIC = "basic"
}
export declare class Auth {
    authId: number;
    userUuid: string;
    authProvider: AuthProvider;
    oauthId: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
