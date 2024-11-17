"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fs_1 = __importDefault(require("fs"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("reflect-metadata");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL
            : 'http://localhost:5173',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT;
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Nanalmoa API')
        .setDescription('나날모아 서비스 개발을 위한 API 문서입니다.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'authorization',
        in: 'header',
    }, 'Access-Token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    fs_1.default.writeFileSync('./swagger.json', JSON.stringify(document));
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(port);
    console.log(`*** ${process.env.NODE_ENV} 환경에서 포트 ${port}번 대기 중입니다.`);
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
//# sourceMappingURL=main.js.map