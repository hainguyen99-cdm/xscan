import { ConfigService } from '../config/config.service';
export interface EmailTemplate {
    subject: string;
    html: string;
}
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    private isEmailEnabled;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private verifyConnectionInBackground;
    testConnection(): Promise<boolean>;
    updateSmtpConfig(newConfig: {
        host?: string;
        port?: number;
        user?: string;
        pass?: string;
        secure?: boolean;
    }): Promise<void>;
    setEmailEnabled(enabled: boolean): void;
    getEmailStatus(): {
        enabled: boolean;
        host: string;
        port: number;
        user: string;
    };
    createTestTransporter(): Promise<void>;
    createGmailOAuth2Transporter(): Promise<void>;
    sendEmailVerification(email: string, token: string, username: string): Promise<any>;
    sendPasswordReset(email: string, token: string, username: string): Promise<any>;
    sendTwoFactorSetup(email: string, username: string, qrCodeUrl: string): Promise<any>;
    sendTwoFactorDisabled(email: string, username: string): Promise<any>;
    sendAccountLocked(email: string, username: string, reason: string): Promise<any>;
    sendAccountUnlocked(email: string, username: string): Promise<any>;
    sendProfileUpdated(email: string, username: string, changes: string[]): Promise<any>;
    sendWelcomeEmail(email: string, username: string, role: string): Promise<any>;
    sendAccountDeletionRequest(email: string, username: string, deletionDate: Date): Promise<any>;
    sendAccountDeletionCancelled(email: string, username: string): Promise<any>;
    sendSecurityAlert(email: string, username: string, alertType: string, details: string): Promise<any>;
    sendRoleChanged(email: string, username: string, oldRole: string, newRole: string): Promise<any>;
    sendVerificationBadgeGranted(email: string, username: string, badge: string): Promise<any>;
    sendEmail(to: string, template: EmailTemplate): Promise<any>;
    private getEmailVerificationTemplate;
    private getPasswordResetTemplate;
    private getTwoFactorSetupTemplate;
    private getTwoFactorDisabledTemplate;
    private getAccountLockedTemplate;
    private getAccountUnlockedTemplate;
    private getProfileUpdatedTemplate;
    private getWelcomeEmailTemplate;
    private getAccountDeletionRequestTemplate;
    private getAccountDeletionCancelledTemplate;
    private getSecurityAlertTemplate;
    private getRoleChangedTemplate;
    private getVerificationBadgeGrantedTemplate;
}
