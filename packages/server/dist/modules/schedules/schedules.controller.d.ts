import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SchedulesService } from './schedules.service';
import { ResponseScheduleDto } from './dto/response-schedule.dto';
import { OCRTranscriptionService } from './OCR-transcription.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ManagerService } from '../manager/manager.service';
export declare class SchedulesController {
    private readonly schedulesService;
    private readonly ocrTranscriptionService;
    private readonly managerService;
    constructor(schedulesService: SchedulesService, ocrTranscriptionService: OCRTranscriptionService, managerService: ManagerService);
    getSchedulesByDate(req: any, date: string, queryUserUuid?: string): Promise<ResponseScheduleDto[]>;
    getSchedulesByWeek(req: any, queryUserUuid: string, date: string): Promise<ResponseScheduleDto[]>;
    getSchedulesByMonth(req: any, queryUserUuid: string, year: number, month: number): Promise<ResponseScheduleDto[]>;
    getSchedulesByYear(req: any, queryUserUuid: string, year: number): Promise<ResponseScheduleDto[]>;
    getSchedulesByDateRange(req: any, queryUserUuid: string, startDate: string, endDate: string): Promise<ResponseScheduleDto[]>;
    getAllSchedulesByUserUuid(req: any): Promise<ResponseScheduleDto[]>;
    getScheduleById(id: number): Promise<ResponseScheduleDto>;
    createSchedule(req: any, createScheduleDto: CreateScheduleDto): Promise<ResponseScheduleDto>;
    updateSchedule(req: any, id: number, updateScheduleDto: UpdateScheduleDto, instanceDate: string, updateType?: 'single' | 'future'): Promise<ResponseScheduleDto>;
    deleteSchedule(req: any, id: number, queryUserUuid: string, instanceDate: string, deleteType?: 'single' | 'future'): Promise<{
        message: string;
    }>;
    uploadVoiceScheduleByRTZR(req: any, file: Express.Multer.File, currentDateTime: string): Promise<CreateScheduleDto[]>;
    uploadVoiceScheduleByWhisper(req: any, file: Express.Multer.File, currentDateTime: string): Promise<CreateScheduleDto[]>;
    uploadImageScheduleClova(file: Express.Multer.File, req: any): Promise<CreateScheduleDto[]>;
}
