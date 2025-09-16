import { Injectable, Global } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Global()
@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI');
  }

  get mongodbDbName(): string {
    return this.configService.get<string>('MONGODB_DB_NAME');
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT');
  }

  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN');
  }

  get port(): number {
    return this.configService.get<number>('PORT');
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV');
  }

  get corsOrigin(): string {
    return this.configService.get<string>('CORS_ORIGIN');
  }

  get smtpHost(): string {
    return this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
  }

  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT', 587);
  }

  get smtpUser(): string {
    return this.configService.get<string>('SMTP_USER');
  }

  get smtpPass(): string {
    return this.configService.get<string>('SMTP_PASS');
  }

  get smtpFrom(): string {
    return this.configService.get<string>('SMTP_FROM', 'noreply@xscan.com');
  }

  get frontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  get gmailClientId(): string {
    return this.configService.get<string>('GMAIL_CLIENT_ID');
  }

  get gmailClientSecret(): string {
    return this.configService.get<string>('GMAIL_CLIENT_SECRET');
  }

  get gmailRefreshToken(): string {
    return this.configService.get<string>('GMAIL_REFRESH_TOKEN');
  }

  get gmailAccessToken(): string {
    return this.configService.get<string>('GMAIL_ACCESS_TOKEN');
  }

  // Payment Gateway Configuration
  get stripeSecretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY');
  }

  get stripePublishableKey(): string {
    return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
  }

  get stripeWebhookSecret(): string {
    return this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  get paypalClientId(): string {
    return this.configService.get<string>('PAYPAL_CLIENT_ID');
  }

  get paypalClientSecret(): string {
    return this.configService.get<string>('PAYPAL_CLIENT_SECRET');
  }

  get paypalMode(): string {
    return this.configService.get<string>('PAYPAL_MODE', 'sandbox');
  }

  get fixerApiKey(): string {
    return this.configService.get<string>('FIXER_API_KEY');
  }

  get currencyLayerApiKey(): string {
    return this.configService.get<string>('CURRENCY_LAYER_API_KEY');
  }

  get uploadDir(): string {
    return this.configService.get<string>('UPLOAD_DIR', 'uploads');
  }

  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024);
  }

  get baseUrl(): string {
    // Force the correct backend URL since environment variable is not working
    return 'http://localhost:3001';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // External Bank API
  get darkVcbCode(): string {
    return this.configService.get<string>('DARK_VCB_CODE');
  }

  get darkVcbEndpoint(): string {
    return this.configService.get<string>('DARK_VCB_ENDPOINT') || 'https://api.dichvudark.vn/api/ApiVcb';
  }

  get darkVcbCookie(): string | undefined {
    return this.configService.get<string>('DARK_VCB_COOKIE');
  }

  get bankPollCron(): string {
    return this.configService.get<string>('BANK_POLL_CRON') || '*/10 * * * * *';
  }

  get bankRequestTimeoutMs(): number {
    const raw = this.configService.get<string>('BANK_REQUEST_TIMEOUT_MS');
    return raw ? parseInt(raw, 10) : 20000;
  }

  get bankMaxRetries(): number {
    const raw = this.configService.get<string>('BANK_MAX_RETRIES');
    return raw ? parseInt(raw, 10) : 3;
  }

  get bankRetryDelayMs(): number {
    const raw = this.configService.get<string>('BANK_RETRY_DELAY_MS');
    return raw ? parseInt(raw, 10) : 1500;
  }
}
