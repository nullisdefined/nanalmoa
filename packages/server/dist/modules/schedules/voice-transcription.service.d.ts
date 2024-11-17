import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class VoiceTranscriptionService {
    private readonly httpService;
    private readonly configService;
    private openai;
    private readonly logger;
    constructor(httpService: HttpService, configService: ConfigService);
    private isRTZRTokenExpiredOrCloseToExpiry;
    getRTZRJwtToken(): Promise<string>;
    ensureValidToken(): Promise<string>;
    transcribeAudio(file: Express.Multer.File): Promise<string>;
    getRTZRTranscriptionResult(transcribeId: string): Promise<any>;
    pollTranscriptionResult(transcribeId: string, maxRetries?: number, interval?: number): Promise<any>;
    RTZRTranscribeResult(file: Express.Multer.File): Promise<string>;
    whisperTranscribeResult(file: Express.Multer.File): Promise<string>;
}
