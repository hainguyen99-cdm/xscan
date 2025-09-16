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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../config/config.service");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isEmailEnabled = true;
        this.initializeTransporter();
    }
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                host: this.configService.smtpHost,
                port: this.configService.smtpPort,
                secure: this.configService.smtpPort === 465,
                auth: {
                    user: this.configService.smtpUser,
                    pass: this.configService.smtpPass,
                },
                tls: {
                    rejectUnauthorized: false,
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000,
            });
            this.logger.warn('Email service initialized - connection verification skipped for now');
            this.verifyConnectionInBackground();
        }
        catch (error) {
            this.logger.error('Failed to initialize email transporter:', error.message);
            this.isEmailEnabled = false;
        }
    }
    async verifyConnectionInBackground() {
        try {
            await this.transporter.verify();
            this.logger.log('Email service connection verified successfully');
        }
        catch (error) {
            this.logger.warn('Email service connection failed (non-blocking):', error.message);
        }
    }
    async testConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('Email connection test successful');
            return true;
        }
        catch (error) {
            this.logger.error('Email connection test failed:', error.message);
            return false;
        }
    }
    async updateSmtpConfig(newConfig) {
        try {
            const config = {
                host: newConfig.host || this.configService.smtpHost,
                port: newConfig.port || this.configService.smtpPort,
                secure: newConfig.secure ?? (this.configService.smtpPort === 465),
                auth: {
                    user: newConfig.user || this.configService.smtpUser,
                    pass: newConfig.pass || this.configService.smtpPass,
                },
                tls: {
                    rejectUnauthorized: false,
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000,
            };
            this.transporter = nodemailer.createTransport(config);
            this.isEmailEnabled = true;
            await this.transporter.verify();
            this.logger.log('SMTP configuration updated successfully');
        }
        catch (error) {
            this.logger.error('Failed to update SMTP configuration:', error.message);
            throw error;
        }
    }
    setEmailEnabled(enabled) {
        this.isEmailEnabled = enabled;
        this.logger.log(`Email service ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEmailStatus() {
        return {
            enabled: this.isEmailEnabled,
            host: this.configService.smtpHost,
            port: this.configService.smtpPort,
            user: this.configService.smtpUser,
        };
    }
    async createTestTransporter() {
        try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            this.isEmailEnabled = true;
            this.logger.log('Test email transporter created successfully');
            this.logger.log(`Test account: ${testAccount.user}`);
            this.logger.log(`Test password: ${testAccount.pass}`);
            this.logger.log('You can view sent emails at: https://ethereal.email');
        }
        catch (error) {
            this.logger.error('Failed to create test transporter:', error.message);
            throw error;
        }
    }
    async createGmailOAuth2Transporter() {
        try {
            const clientId = this.configService.gmailClientId;
            const clientSecret = this.configService.gmailClientSecret;
            const refreshToken = this.configService.gmailRefreshToken;
            if (!clientId || !clientSecret || !refreshToken) {
                throw new Error('Gmail OAuth2 credentials not configured');
            }
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: this.configService.smtpUser,
                    clientId,
                    clientSecret,
                    refreshToken,
                    accessToken: this.configService.gmailAccessToken,
                },
            });
            this.isEmailEnabled = true;
            this.logger.log('Gmail OAuth2 transporter created successfully');
        }
        catch (error) {
            this.logger.error('Failed to create Gmail OAuth2 transporter:', error.message);
            throw error;
        }
    }
    async sendEmailVerification(email, token, username) {
        const verificationUrl = `${this.configService.frontendUrl}/verify-email?token=${token}`;
        const template = this.getEmailVerificationTemplate(username, verificationUrl);
        return this.sendEmail(email, template);
    }
    async sendPasswordReset(email, token, username) {
        const resetUrl = `${this.configService.frontendUrl}/reset-password?token=${token}`;
        const template = this.getPasswordResetTemplate(username, resetUrl);
        return this.sendEmail(email, template);
    }
    async sendTwoFactorSetup(email, username, qrCodeUrl) {
        const template = this.getTwoFactorSetupTemplate(username, qrCodeUrl);
        return this.sendEmail(email, template);
    }
    async sendTwoFactorDisabled(email, username) {
        const template = this.getTwoFactorDisabledTemplate(username);
        return this.sendEmail(email, template);
    }
    async sendAccountLocked(email, username, reason) {
        const template = this.getAccountLockedTemplate(username, reason);
        return this.sendEmail(email, template);
    }
    async sendAccountUnlocked(email, username) {
        const template = this.getAccountUnlockedTemplate(username);
        return this.sendEmail(email, template);
    }
    async sendProfileUpdated(email, username, changes) {
        const template = this.getProfileUpdatedTemplate(username, changes);
        return this.sendEmail(email, template);
    }
    async sendWelcomeEmail(email, username, role) {
        const template = this.getWelcomeEmailTemplate(username, role);
        return this.sendEmail(email, template);
    }
    async sendAccountDeletionRequest(email, username, deletionDate) {
        const template = this.getAccountDeletionRequestTemplate(username, deletionDate);
        return this.sendEmail(email, template);
    }
    async sendAccountDeletionCancelled(email, username) {
        const template = this.getAccountDeletionCancelledTemplate(username);
        return this.sendEmail(email, template);
    }
    async sendSecurityAlert(email, username, alertType, details) {
        const template = this.getSecurityAlertTemplate(username, alertType, details);
        return this.sendEmail(email, template);
    }
    async sendRoleChanged(email, username, oldRole, newRole) {
        const template = this.getRoleChangedTemplate(username, oldRole, newRole);
        return this.sendEmail(email, template);
    }
    async sendVerificationBadgeGranted(email, username, badge) {
        const template = this.getVerificationBadgeGrantedTemplate(username, badge);
        return this.sendEmail(email, template);
    }
    async sendEmail(to, template) {
        if (!this.isEmailEnabled) {
            this.logger.warn(`Email service is disabled. Cannot send email to ${to}.`);
            return { success: false, message: 'Email service is currently disabled.' };
        }
        try {
            const mailOptions = {
                from: this.configService.smtpFrom || this.configService.smtpUser,
                to,
                subject: template.subject,
                html: template.html,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }
    getEmailVerificationTemplate(username, verificationUrl) {
        return {
            subject: 'Verify Your Email Address - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Verification</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to XScan!</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Thank you for registering with XScan. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db; font-size: 14px; background-color: #ecf0f1; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you didn't create an account with XScan, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getPasswordResetTemplate(username, resetUrl) {
        return {
            subject: 'Reset Your Password - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Password Reset</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #e74c3c; font-size: 14px; background-color: #ecf0f1; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request a password reset, please ignore this email.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getTwoFactorSetupTemplate(username, qrCodeUrl) {
        return {
            subject: 'Two-Factor Authentication Setup - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Security Setup</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Two-Factor Authentication Setup</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">You have successfully enabled two-factor authentication for your XScan account. This adds an extra layer of security to protect your account.</p>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="color: #2c3e50; font-weight: bold; margin-bottom: 15px;">Scan this QR code with your authenticator app:</p>
              <img src="${qrCodeUrl}" alt="QR Code for 2FA" style="max-width: 200px; border-radius: 5px;">
            </div>
            
            <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; margin: 0; font-size: 14px;">
                <strong>✅ Success:</strong> Your account is now more secure with two-factor authentication enabled.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you can't scan the QR code, you can manually enter the secret key provided in your authenticator app settings.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getTwoFactorDisabledTemplate(username) {
        return {
            subject: 'Two-Factor Authentication Disabled - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Security Update</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Two-Factor Authentication Disabled</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Two-factor authentication has been disabled for your XScan account.</p>
            
            <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #e67e22; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> Your account is now less secure. Consider re-enabling two-factor authentication for better protection.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you didn't disable two-factor authentication, please contact our support team immediately.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getAccountLockedTemplate(username, reason) {
        return {
            subject: 'Account Locked - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Security</p>
            </div>
            
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Account Locked</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Your XScan account has been temporarily locked for security reasons.</p>
            
            <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #e67e22; margin: 0; font-size: 14px;">
                <strong>Reason:</strong> ${reason}
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">To unlock your account, please contact our support team or wait for the automatic unlock period to expire.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getAccountUnlockedTemplate(username) {
        return {
            subject: 'Account Unlocked - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Access</p>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 20px;">Account Unlocked</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Your XScan account has been unlocked and you can now access it normally.</p>
            
            <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; margin: 0; font-size: 14px;">
                <strong>✅ Success:</strong> Your account is now accessible again.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you have any questions about why your account was locked, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getProfileUpdatedTemplate(username, changes) {
        const changesList = changes
            .map((change) => `<li style="color: #34495e; margin: 5px 0;">${change}</li>`)
            .join('');
        return {
            subject: 'Profile Updated - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Profile Update</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Profile Updated</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Your XScan profile has been successfully updated with the following changes:</p>
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                ${changesList}
              </ul>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If you didn't make these changes, please contact our support team immediately.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getWelcomeEmailTemplate(username, role) {
        return {
            subject: 'Welcome to XScan!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Welcome!</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to XScan!</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Welcome to XScan! We're excited to have you as part of our community.</p>
            
            <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; margin: 0; font-size: 14px;">
                <strong>Your Role:</strong> ${role}
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">You can now start using all the features available to your account type. If you have any questions, feel free to explore our help center or contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getAccountDeletionRequestTemplate(username, deletionDate) {
        const formattedDate = deletionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return {
            subject: 'Account Deletion Request - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Deletion</p>
            </div>
            
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Account Deletion Request</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">We have received your request to delete your XScan account.</p>
            
            <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #e67e22; margin: 0; font-size: 14px;">
                <strong>Scheduled Deletion Date:</strong> ${formattedDate}
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">Your account will be permanently deleted on the scheduled date. You can cancel this request at any time before the deletion date by logging into your account.</p>
            
            <p style="color: #34495e; line-height: 1.6;">If you didn't request this deletion, please contact our support team immediately.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getAccountDeletionCancelledTemplate(username) {
        return {
            subject: 'Account Deletion Cancelled - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Status</p>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 20px;">Account Deletion Cancelled</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Your account deletion request has been cancelled. Your XScan account remains active and accessible.</p>
            
            <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; margin: 0; font-size: 14px;">
                <strong>✅ Success:</strong> Your account is safe and will not be deleted.
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">You can continue using all XScan features as normal. If you have any questions, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `
        };
    }
    getSecurityAlertTemplate(username, alertType, details) {
        return {
            subject: `Security Alert - ${alertType} - XScan`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Security Alert</p>
            </div>
            
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Security Alert</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">We detected a security event on your XScan account that requires your attention.</p>
            
            <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #e67e22; margin: 0; font-size: 14px;">
                <strong>Alert Type:</strong> ${alertType}<br>
                <strong>Details:</strong> ${details}
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">If this activity was not performed by you, please change your password immediately and contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getRoleChangedTemplate(username, oldRole, newRole) {
        return {
            subject: 'Account Role Updated - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Account Update</p>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Account Role Updated</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Your XScan account role has been updated.</p>
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #34495e; margin: 0; font-size: 14px;">
                <strong>Previous Role:</strong> ${oldRole}<br>
                <strong>New Role:</strong> ${newRole}
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">This change may affect the features and permissions available to your account. If you have any questions, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
    getVerificationBadgeGrantedTemplate(username, badge) {
        return {
            subject: 'Verification Badge Granted - XScan',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">XScan</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Achievement Unlocked</p>
            </div>
            
            <h2 style="color: #f39c12; margin-bottom: 20px;">Verification Badge Granted</h2>
            <p style="color: #34495e; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #34495e; line-height: 1.6;">Congratulations! You have been granted a verification badge on your XScan profile.</p>
            
            <div style="background-color: #fef9e7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="color: #f39c12; margin: 0; font-size: 16px; font-weight: bold;">
                🏆 ${badge} Badge
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">This badge will be displayed on your profile and helps other users trust your account. Keep up the great work!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This is an automated email from XScan. Please do not reply to this email.<br>
              If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map