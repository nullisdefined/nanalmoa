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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRScheduleUploadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class OCRScheduleUploadDto {
}
exports.OCRScheduleUploadDto = OCRScheduleUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'file', description: '이미지 파일' }),
    __metadata("design:type", Object)
], OCRScheduleUploadDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-09-26T12:45:50Z',
        description: '음성 인식 시점의 현재 날짜',
        type: String,
    }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], OCRScheduleUploadDto.prototype, "currentDateTime", void 0);
//# sourceMappingURL=ocr-schedule-upload.dto.js.map