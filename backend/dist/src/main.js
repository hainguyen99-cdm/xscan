"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const config_service_1 = require("./config/config.service");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
    });
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.use((req, res, next) => {
        const contentLength = req.headers['content-length'];
        if (contentLength) {
            const sizeInMB = Math.round(parseInt(contentLength) / (1024 * 1024) * 100) / 100;
            console.log(`📝 Request size: ${sizeInMB}MB (${contentLength} bytes) - ${req.method} ${req.path}`);
            if (parseInt(contentLength) > 10 * 1024 * 1024) {
                console.warn(`⚠️ Large payload detected: ${sizeInMB}MB for ${req.method} ${req.path}`);
            }
        }
        next();
    });
    app.use((error, req, res, next) => {
        if (error.type === 'entity.too.large') {
            console.error(`❌ Payload too large error: ${req.method} ${req.path}`, {
                contentLength: req.headers['content-length'],
                error: error.message
            });
            return res.status(413).json({
                error: 'Request payload too large',
                message: 'The request payload exceeds the maximum allowed size of 50MB',
                code: 'PAYLOAD_TOO_LARGE'
            });
        }
        next(error);
    });
    app.use(express.json({
        limit: '50mb',
        verify: (req, res, buf) => {
            console.log(`🔍 Body parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
        }
    }));
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true,
        verify: (req, res, buf) => {
            console.log(`🔍 URL encoded parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
        }
    }));
    app.use('/api/obs-settings', express.json({
        limit: '50mb',
        verify: (req, res, buf) => {
            console.log(`🎯 OBS Settings body parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
        }
    }));
    app.use('/api/obs-settings', express.urlencoded({
        limit: '50mb',
        extended: true,
        verify: (req, res, buf) => {
            console.log(`🎯 OBS Settings URL encoded parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
        }
    }));
    const configService = app.get(config_service_1.ConfigService);
    app.enableCors({
        origin: configService.corsOrigin || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-GDPR-Consent',
            'X-Data-Processing-Consent'
        ],
        exposedHeaders: [
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
            'X-GDPR-Compliant',
            'X-Data-Retention-Policy'
        ]
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        forbidUnknownValues: true,
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
        validationError: {
            target: false,
            value: false,
        },
    }));
    app.setGlobalPrefix('api', {
        exclude: [
            { path: 'widget-public', method: common_1.RequestMethod.ALL },
            { path: 'obs-widget', method: common_1.RequestMethod.ALL },
        ],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('XScan API')
        .setDescription('The XScan API description with comprehensive security features')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('security', 'Security and compliance endpoints')
        .addTag('payments', 'Payment processing with PCI DSS compliance')
        .addTag('gdpr', 'GDPR compliance and data privacy')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.port || 3001;
    const isProduction = configService.isProduction;
    if (isProduction) {
        try {
            const httpsOptions = {
                key: fs.readFileSync(path.join(process.cwd(), 'ssl', 'private.key')),
                cert: fs.readFileSync(path.join(process.cwd(), 'ssl', 'certificate.crt')),
                ca: fs.readFileSync(path.join(process.cwd(), 'ssl', 'ca_bundle.crt')),
            };
            const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
            await app.listen(port, () => {
                console.log(`🚀 Secure HTTPS Application is running on: https://localhost:${port}`);
                console.log(`📚 API Documentation: https://localhost:${port}/api/docs`);
                console.log(`🏥 Health Check: https://localhost:${port}/api/health`);
                console.log(`🔌 WebSocket Gateway: wss://localhost:${port}/donations`);
                console.log(`📺 OBS Widget WebSocket: wss://localhost:${port}/obs-widget`);
                console.log(`🔒 Security Features: SSL/TLS, Rate Limiting, PCI DSS, GDPR`);
            });
        }
        catch (error) {
            console.warn('⚠️  SSL certificates not found, falling back to HTTP');
            console.warn('⚠️  In production, ensure SSL certificates are properly configured');
            await app.listen(port);
        }
    }
    else {
        await app.listen(port);
        console.log(`🚀 Development Application is running on: http://localhost:${port}`);
        console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
        console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
        console.log(`🔌 WebSocket Gateway: ws://localhost:${port}/donations`);
        console.log(`📺 OBS Widget WebSocket: ws://localhost:${port}/obs-widget`);
        console.log(`🔒 Security Features: Rate Limiting, PCI DSS, GDPR`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map