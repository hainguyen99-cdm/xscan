import { Controller, Post, Get, Put, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

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

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('status')
  @Roles(UserRole.ADMIN)
  getEmailStatus() {
    return this.emailService.getEmailStatus();
  }

  @Post('test-connection')
  @Roles(UserRole.ADMIN)
  async testConnection() {
    const isConnected = await this.emailService.testConnection();
    return { success: isConnected };
  }

  @Put('config')
  @Roles(UserRole.ADMIN)
  async updateConfig(@Body() config: EmailConfigDto) {
    await this.emailService.updateSmtpConfig(config);
    return { success: true, message: 'SMTP configuration updated' };
  }

  @Post('test-transporter')
  @Roles(UserRole.ADMIN)
  async createTestTransporter() {
    await this.emailService.createTestTransporter();
    return { success: true, message: 'Test transporter created' };
  }

  @Post('gmail-oauth2')
  @Roles(UserRole.ADMIN)
  async createGmailOAuth2Transporter() {
    await this.emailService.createGmailOAuth2Transporter();
    return { success: true, message: 'Gmail OAuth2 transporter created' };
  }

  @Post('test-email')
  @Roles(UserRole.ADMIN)
  async sendTestEmail(@Body() testData: EmailTestDto) {
    const template = {
      subject: testData.subject || 'Test Email from XScan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email to verify your email configuration.</p>
          <p><strong>Message:</strong> ${testData.message || 'No message provided'}</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from XScan.
          </p>
        </div>
      `
    };

    const result = await this.emailService.sendEmail(testData.to, template);
    return { success: true, result };
  }

  @Post('enable')
  @Roles(UserRole.ADMIN)
  enableEmailService() {
    this.emailService.setEmailEnabled(true);
    return { success: true, message: 'Email service enabled' };
  }

  @Post('disable')
  @Roles(UserRole.ADMIN)
  disableEmailService() {
    this.emailService.setEmailEnabled(false);
    return { success: true, message: 'Email service disabled' };
  }
} 