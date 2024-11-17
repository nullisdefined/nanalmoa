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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OCRTranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRTranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const vision_1 = require("@google-cloud/vision");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const openai_1 = __importDefault(require("openai"));
const schedules_service_1 = require("./schedules.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const users_routine_service_1 = require("../users/users-routine.service");
let OCRTranscriptionService = OCRTranscriptionService_1 = class OCRTranscriptionService {
    constructor(configService, scheduleService, usersRoutineService) {
        this.configService = configService;
        this.scheduleService = scheduleService;
        this.usersRoutineService = usersRoutineService;
        this.logger = new common_1.Logger(OCRTranscriptionService_1.name);
        this.client = new vision_1.ImageAnnotatorClient(this.getCredentials());
    }
    getCredentials() {
        return {
            projectId: this.configService.get('GOOGLE_CLOUD_PROJECT_ID'),
            credentials: {
                private_key: this.configService.get('GOOGLE_CLOUD_PRIVATE_KEY'),
                client_email: this.configService.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
            },
        };
    }
    async detectTextByCloudVisionOCR(imageBuffer) {
        try {
            const [result] = await this.client.textDetection(imageBuffer);
            const detections = result.textAnnotations;
            if (!detections || detections.length === 0) {
                this.logger.warn('이미지에서 텍스트가 감지되지 않았습니다.');
                return '';
            }
            return detections[0].description || '';
        }
        catch (error) {
            this.logger.error(`OCR 처리 중 오류 발생: ${error.message}`, error.stack);
            if (error.code) {
                this.logger.error(`오류 코드: ${error.code}`);
            }
            if (error.details) {
                this.logger.error(`오류 세부 정보: ${error.details}`);
            }
            throw new Error(`OCR 처리 중 오류 발생: ${error.message}`);
        }
    }
    async extractTextFromNaverOCR(imageFile) {
        try {
            console.log('Naver Clova OCR 호출 중...');
            const formData = new form_data_1.default();
            formData.append('message', JSON.stringify({
                version: 'V2',
                requestId: '1234',
                timestamp: Date.now(),
                lang: 'ko',
                images: [
                    {
                        format: imageFile.mimetype.split('/')[1],
                        name: 'demo_image',
                    },
                ],
                enableTableDetection: false,
            }));
            formData.append('file', imageFile.buffer, {
                filename: imageFile.originalname,
                contentType: imageFile.mimetype,
            });
            const response = await axios_1.default.post(`https://8gqvbgtnnm.apigw.ntruss.com/custom/v1/34860/2e652dcb90b77cb93bf55721d77d33d2bae7a6912d8bc0e3a210c7004e3c3875/general`, formData, {
                headers: {
                    'X-OCR-SECRET': this.configService.get('CLOVA_OCR_SECRET'),
                    ...formData.getHeaders(),
                },
            });
            const extractedText = response.data.images[0].fields.map((field) => field.inferText);
            return extractedText.join(' ');
        }
        catch (error) {
            console.error('Naver Clova OCR 호출 오류:', error);
            throw new Error('Naver Clova OCR 호출 실패');
        }
    }
    async processWithGptOCR(OCRResult) {
        const openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY_OCR'),
        });
        const gptResponse = await openai.chat.completions.create({
            model: this.configService.get('OPENAI_FINETUNING_MODEL_OCR'),
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that extracts intent, tablets, times, and days information from conversations.',
                },
                {
                    role: 'user',
                    content: `${OCRResult}`,
                },
            ],
            max_tokens: 1000,
            temperature: 0,
        });
        const gptResponseContent = gptResponse.choices[0].message.content;
        console.log(this.scheduleService.parseGptResponse(gptResponseContent));
        return this.scheduleService.parseGptResponse(gptResponseContent);
    }
    async extractMedicationInfo(ocrResult) {
        const gptProcessedResult = await this.processWithGptOCR(ocrResult);
        return this.parseMedicationInfo(gptProcessedResult);
    }
    parseMedicationInfo(gptResult) {
        const maxTimesPerDay = Math.max(...gptResult.map((item) => item.times || 1));
        const maxDurationDays = Math.max(...gptResult.map((item) => item.days || 1));
        const allTablets = gptResult
            .map((item) => `${item.tablets} ${item.intent}`)
            .join(', ');
        const allInstructions = gptResult
            .map((item) => `${item.intent}: ${item.tablets}정 ${item.times}회 ${item.days}일`)
            .join('. ');
        const medicationInfo = {
            intent: '복약',
            tablets: allTablets,
            timesPerDay: maxTimesPerDay,
            durationDays: maxDurationDays,
            specificTimes: [],
            additionalInstructions: allInstructions,
        };
        medicationInfo.durationDays = Math.min(Math.max(medicationInfo.durationDays, 1), 365);
        medicationInfo.timesPerDay = Math.min(Math.max(medicationInfo.timesPerDay, 1), 24);
        return medicationInfo;
    }
    async processMedicationImage(imageFile, userUuid) {
        try {
            const ocrResult = await this.extractTextFromNaverOCR(imageFile);
            const medicationInfo = await this.extractMedicationInfo(ocrResult);
            console.log('최대 일수:', medicationInfo.durationDays);
            console.log('1일 최대 복용 횟수:', medicationInfo.timesPerDay);
            const userRoutine = await this.usersRoutineService.getUserRoutine(userUuid);
            return this.createSchedulesFromMedicationInfo(medicationInfo, userRoutine);
        }
        catch (error) {
            this.logger.error(`약 이미지 처리 중 오류 발생: ${error.message}`, error.stack);
            throw new Error(`약 이미지 처리 중 오류 발생: ${error.message}`);
        }
    }
    createSchedulesFromMedicationInfo(medicationInfo, userRoutine) {
        const schedules = [];
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + medicationInfo.durationDays * 24 * 60 * 60 * 1000);
        const routineTimes = [
            userRoutine.wakeUpTime,
            userRoutine.breakfastTime,
            userRoutine.lunchTime,
            userRoutine.dinnerTime,
            userRoutine.bedTime,
        ];
        let medicationTimes;
        if (medicationInfo.specificTimes.length > 0) {
            medicationTimes = medicationInfo.specificTimes;
        }
        else {
            medicationTimes = this.calculateMedicationTimes(routineTimes, medicationInfo.timesPerDay);
        }
        medicationTimes.forEach((time) => {
            const [hours, minutes] = time.split(':').map(Number);
            const schedule = new create_schedule_dto_1.CreateScheduleDto();
            schedule.startDate = new Date(startDate);
            schedule.startDate.setHours(hours, minutes, 0, 0);
            schedule.endDate = new Date(schedule.startDate);
            schedule.endDate.setMinutes(schedule.endDate.getMinutes() + 30);
            schedule.title = `복약`;
            schedule.memo = '';
            schedule.isAllDay = false;
            schedule.categoryId = 6;
            schedule.isRecurring = true;
            schedule.repeatType = 'daily';
            schedule.repeatEndDate = new Date(endDate);
            schedule.recurringInterval = 1;
            schedules.push(schedule);
        });
        return schedules;
    }
    calculateMedicationTimes(routineTimes, timesPerDay) {
        const times = [];
        switch (timesPerDay) {
            case 1:
                times.push(routineTimes[2]);
                break;
            case 2:
                times.push(routineTimes[1], routineTimes[3]);
                break;
            case 3:
                times.push(routineTimes[1], routineTimes[2], routineTimes[3]);
                break;
            default:
                const wakeUpTime = this.parseTime(routineTimes[0]);
                const bedTime = this.parseTime(routineTimes[4]);
                const interval = (bedTime - wakeUpTime) / (timesPerDay + 1);
                for (let i = 1; i <= timesPerDay; i++) {
                    const medicationTime = new Date(wakeUpTime + interval * i);
                    times.push(this.formatTime(medicationTime));
                }
        }
        return times;
    }
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
    }
    formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
};
exports.OCRTranscriptionService = OCRTranscriptionService;
exports.OCRTranscriptionService = OCRTranscriptionService = OCRTranscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => schedules_service_1.SchedulesService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        schedules_service_1.SchedulesService,
        users_routine_service_1.UsersRoutineService])
], OCRTranscriptionService);
//# sourceMappingURL=OCR-transcription.service.js.map