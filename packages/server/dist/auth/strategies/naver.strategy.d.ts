import { Strategy } from 'passport-naver-v2';
import { AuthService } from '../auth.service';
declare const NaverStrategy_base: new (...args: any[]) => Strategy;
export declare class NaverStrategy extends NaverStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any>;
}
export {};
