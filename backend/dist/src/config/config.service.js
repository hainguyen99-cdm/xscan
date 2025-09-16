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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ConfigService = class ConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get mongodbUri() {
        return this.configService.get('MONGODB_URI');
    }
    get mongodbDbName() {
        return this.configService.get('MONGODB_DB_NAME');
    }
    get redisHost() {
        return this.configService.get('REDIS_HOST');
    }
    get redisPort() {
        return this.configService.get('REDIS_PORT');
    }
    get redisPassword() {
        return this.configService.get('REDIS_PASSWORD');
    }
    get redisDb() {
        return this.configService.get('REDIS_DB');
    }
    get jwtSecret() {
        return this.configService.get('JWT_SECRET');
    }
    get jwtExpiresIn() {
        return this.configService.get('JWT_EXPIRES_IN');
    }
    get port() {
        return this.configService.get('PORT');
    }
    get nodeEnv() {
        return this.configService.get('NODE_ENV');
    }
    get corsOrigin() {
        return this.configService.get('CORS_ORIGIN');
    }
    get smtpHost() {
        return this.configService.get('SMTP_HOST', 'smtp.gmail.com');
    }
    get smtpPort() {
        return this.configService.get('SMTP_PORT', 587);
    }
    get smtpUser() {
        return this.configService.get('SMTP_USER');
    }
    get smtpPass() {
        return this.configService.get('SMTP_PASS');
    }
    get smtpFrom() {
        return this.configService.get('SMTP_FROM', 'noreply@xscan.com');
    }
    get frontendUrl() {
        return this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    }
    get gmailClientId() {
        return this.configService.get('GMAIL_CLIENT_ID');
    }
    get gmailClientSecret() {
        return this.configService.get('GMAIL_CLIENT_SECRET');
    }
    get gmailRefreshToken() {
        return this.configService.get('GMAIL_REFRESH_TOKEN');
    }
    get gmailAccessToken() {
        return this.configService.get('GMAIL_ACCESS_TOKEN');
    }
    get stripeSecretKey() {
        return this.configService.get('STRIPE_SECRET_KEY');
    }
    get stripePublishableKey() {
        return this.configService.get('STRIPE_PUBLISHABLE_KEY');
    }
    get stripeWebhookSecret() {
        return this.configService.get('STRIPE_WEBHOOK_SECRET');
    }
    get paypalClientId() {
        return this.configService.get('PAYPAL_CLIENT_ID');
    }
    get paypalClientSecret() {
        return this.configService.get('PAYPAL_CLIENT_SECRET');
    }
    get paypalMode() {
        return this.configService.get('PAYPAL_MODE', 'sandbox');
    }
    get fixerApiKey() {
        return this.configService.get('FIXER_API_KEY');
    }
    get currencyLayerApiKey() {
        return this.configService.get('CURRENCY_LAYER_API_KEY');
    }
    get uploadDir() {
        return this.configService.get('UPLOAD_DIR', 'uploads');
    }
    get maxFileSize() {
        return this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024);
    }
    get baseUrl() {
        return 'http://localhost:3001';
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get darkVcbCode() {
        return this.configService.get('DARK_VCB_CODE');
    }
    get darkVcbEndpoint() {
        return this.configService.get('DARK_VCB_ENDPOINT') || 'https://api.dichvudark.vn/api/ApiVcb';
    }
    get darkVcbCookie() {
        return this.configService.get('DARK_VCB_COOKIE');
    }
    get bankPollCron() {
        return this.configService.get('BANK_POLL_CRON') || '*/10 * * * * *';
    }
    get bankRequestTimeoutMs() {
        const raw = this.configService.get('BANK_REQUEST_TIMEOUT_MS');
        return raw ? parseInt(raw, 10) : 20000;
    }
    get bankMaxRetries() {
        const raw = this.configService.get('BANK_MAX_RETRIES');
        return raw ? parseInt(raw, 10) : 3;
    }
    get bankRetryDelayMs() {
        const raw = this.configService.get('BANK_RETRY_DELAY_MS');
        return raw ? parseInt(raw, 10) : 1500;
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ConfigService);
//# sourceMappingURL=config.service.js.map