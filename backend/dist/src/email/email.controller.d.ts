import { EmailService } from './email.service';
export interface EmailConfigDto {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    secure?: boolean;
}
export interface EmailTestDto {
    to: string;
    subject?: string;
    message?: string;
}
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    getEmailStatus(): {
        enabled: boolean;
        host: string;
        port: number;
        user: string;
    };
    testConnection(): Promise<{
        success: boolean;
    }>;
    updateConfig(config: EmailConfigDto): Promise<{
        success: boolean;
        message: string;
    }>;
    createTestTransporter(): Promise<{
        success: boolean;
        message: string;
    }>;
    createGmailOAuth2Transporter(): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTestEmail(testData: EmailTestDto): Promise<{
        success: boolean;
        result: any;
    }>;
    enableEmailService(): {
        success: boolean;
        message: string;
    };
    disableEmailService(): {
        success: boolean;
        message: string;
    };
}
