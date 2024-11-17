import { ConfigService } from '@nestjs/config';
export declare class CoolSmsService {
    private configService;
    private messageService;
    constructor(configService: ConfigService);
    sendVerificationCode(phoneNumber: string, verificationCode: string, expirationMinutes: number): Promise<boolean>;
}
