import { ConfigService } from '../../config/config.service';
export declare class CommonService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getEnvironment(): string;
    isProduction(): boolean;
    getVersion(): string;
    getAppName(): string;
    logSecurityEvent(event: string, details: any, level?: 'info' | 'warn' | 'error'): void;
    generateSecureString(length?: number): string;
    sanitizeInput(input: string): string;
    validateEmail(email: string): boolean;
    validateUrl(url: string): boolean;
    containsSQLInjection(input: string): boolean;
    containsXSS(input: string): boolean;
    getSecurityConfig(): any;
}
