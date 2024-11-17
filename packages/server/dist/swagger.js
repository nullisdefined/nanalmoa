"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const fs_1 = __importDefault(require("fs"));
async function generateSwaggerJson() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error'] });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Nanalmoa API')
        .setDescription('나날모아 서비스 개발을 위한 API 문서입니다.')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    fs_1.default.writeFileSync('./swagger.json', JSON.stringify(document));
    await app.close();
    console.log('Swagger JSON 파일이 생성되었습니다.');
}
generateSwaggerJson();
//# sourceMappingURL=swagger.js.map