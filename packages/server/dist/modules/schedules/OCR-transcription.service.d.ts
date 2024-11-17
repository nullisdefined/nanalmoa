import { ConfigService } from '@nestjs/config';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UsersRoutineService } from '../users/users-routine.service';
export declare class OCRTranscriptionService {
    private configService;
    private scheduleService;
    private usersRoutineService;
    private client;
    private readonly logger;
    constructor(configService: ConfigService, scheduleService: SchedulesService, usersRoutineService: UsersRoutineService);
    private getCredentials;
    detectTextByCloudVisionOCR(imageBuffer: Buffer): Promise<string>;
    extractTextFromNaverOCR(imageFile: Express.Multer.File): Promise<string>;
    processWithGptOCR(OCRResult: string): Promise<any>;
    private extractMedicationInfo;
    private parseMedicationInfo;
    processMedicationImage(imageFile: Express.Multer.File, userUuid: string): Promise<CreateScheduleDto[]>;
    private createSchedulesFromMedicationInfo;
    private calculateMedicationTimes;
    private parseTime;
    private formatTime;
}
