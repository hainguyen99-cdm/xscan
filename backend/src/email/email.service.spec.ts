import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '../config/config.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransporter: any;

  const mockConfigService = {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'test@example.com',
    smtpPass: 'password123',
    smtpFrom: 'noreply@xscan.com',
    frontendUrl: 'http://localhost:3000',
  };

  beforeEach(async () => {
    // Create mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    };

    // Mock nodemailer.createTransport
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    // Wait for the verifyConnection to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create transporter with correct configuration', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: mockConfigService.smtpHost,
      port: mockConfigService.smtpPort,
      secure: false,
      auth: {
        user: mockConfigService.smtpUser,
        pass: mockConfigService.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  });

  it('should verify connection on initialization', () => {
    expect(mockTransporter.verify).toHaveBeenCalled();
  });

  describe('sendEmailVerification', () => {
    it('should send email verification with correct template', async () => {
      const email = 'test@example.com';
      const token = 'verification-token';
      const username = 'testuser';

      await service.sendEmailVerification(email, token, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Verify Your Email Address - XScan',
        html: expect.stringContaining('Welcome to XScan!'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('verification-token');
      expect(sentEmail.html).toContain(
        'http://localhost:3000/verify-email?token=verification-token',
      );
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email with correct template', async () => {
      const email = 'test@example.com';
      const token = 'reset-token';
      const username = 'testuser';

      await service.sendPasswordReset(email, token, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Reset Your Password - XScan',
        html: expect.stringContaining('Password Reset Request'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('reset-token');
      expect(sentEmail.html).toContain(
        'http://localhost:3000/reset-password?token=reset-token',
      );
    });
  });

  describe('sendTwoFactorSetup', () => {
    it('should send 2FA setup email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const qrCodeUrl = 'data:image/png;base64,test-qr-code';

      await service.sendTwoFactorSetup(email, username, qrCodeUrl);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Two-Factor Authentication Setup - XScan',
        html: expect.stringContaining('Two-Factor Authentication Setup'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('data:image/png;base64,test-qr-code');
    });
  });

  describe('sendTwoFactorDisabled', () => {
    it('should send 2FA disabled email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';

      await service.sendTwoFactorDisabled(email, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Two-Factor Authentication Disabled - XScan',
        html: expect.stringContaining('Two-Factor Authentication Disabled'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Security Notice');
    });
  });

  describe('sendAccountLocked', () => {
    it('should send account locked email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const reason = 'Multiple failed login attempts';

      await service.sendAccountLocked(email, username, reason);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Account Locked - XScan',
        html: expect.stringContaining('Account Locked'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Multiple failed login attempts');
    });
  });

  describe('sendAccountUnlocked', () => {
    it('should send account unlocked email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';

      await service.sendAccountUnlocked(email, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Account Unlocked - XScan',
        html: expect.stringContaining('Account Unlocked'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Success');
    });
  });

  describe('sendProfileUpdated', () => {
    it('should send profile updated email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const changes = ['Profile picture updated', 'Bio updated'];

      await service.sendProfileUpdated(email, username, changes);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Profile Updated - XScan',
        html: expect.stringContaining('Profile Updated'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Profile picture updated');
      expect(sentEmail.html).toContain('Bio updated');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const role = 'Streamer';

      await service.sendWelcomeEmail(email, username, role);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Welcome to XScan!',
        html: expect.stringContaining('Welcome to XScan!'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Streamer');
    });
  });

  describe('sendAccountDeletionRequest', () => {
    it('should send account deletion request email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const deletionDate = new Date('2024-01-15');

      await service.sendAccountDeletionRequest(email, username, deletionDate);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Account Deletion Request - XScan',
        html: expect.stringContaining('Account Deletion Request'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('January 15, 2024');
    });
  });

  describe('sendAccountDeletionCancelled', () => {
    it('should send account deletion cancelled email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';

      await service.sendAccountDeletionCancelled(email, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Account Deletion Cancelled - XScan',
        html: expect.stringContaining('Account Deletion Cancelled'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Success');
    });
  });

  describe('sendSecurityAlert', () => {
    it('should send security alert email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const alertType = 'Suspicious Login';
      const details = 'Login from unknown IP address';

      await service.sendSecurityAlert(email, username, alertType, details);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Security Alert - Suspicious Login - XScan',
        html: expect.stringContaining('Security Alert'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Suspicious Login');
      expect(sentEmail.html).toContain('Login from unknown IP address');
    });
  });

  describe('sendRoleChanged', () => {
    it('should send role changed email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const oldRole = 'Donor';
      const newRole = 'Streamer';

      await service.sendRoleChanged(email, username, oldRole, newRole);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Account Role Updated - XScan',
        html: expect.stringContaining('Account Role Updated'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Donor');
      expect(sentEmail.html).toContain('Streamer');
    });
  });

  describe('sendVerificationBadgeGranted', () => {
    it('should send verification badge granted email with correct template', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const badge = 'Verified Streamer';

      await service.sendVerificationBadgeGranted(email, username, badge);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfigService.smtpFrom,
        to: email,
        subject: 'Verification Badge Granted - XScan',
        html: expect.stringContaining('Verification Badge Granted'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('testuser');
      expect(sentEmail.html).toContain('Verified Streamer');
      expect(sentEmail.html).toContain('🏆');
    });
  });

  describe('error handling', () => {
    it('should handle email sending errors gracefully', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const token = 'test-token';

      // Mock sendMail to throw an error
      mockTransporter.sendMail.mockRejectedValueOnce(
        new Error('SMTP connection failed'),
      );

      await expect(
        service.sendEmailVerification(email, token, username),
      ).rejects.toThrow('SMTP connection failed');
    });

    it('should handle connection verification errors gracefully', async () => {
      // Mock verify to throw an error
      mockTransporter.verify.mockRejectedValueOnce(
        new Error('Connection failed'),
      );

      // Create a new instance to trigger the error
      const newService = new EmailService(mockConfigService as any);

      // The service should still be created even if verification fails
      expect(newService).toBeDefined();
    });
  });

  describe('email templates', () => {
    it('should include proper styling and branding', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const token = 'test-token';

      await service.sendEmailVerification(email, token, username);

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];

      // Check for proper styling
      expect(sentEmail.html).toContain('font-family: Arial, sans-serif');
      expect(sentEmail.html).toContain('background-color: #f9f9f9');
      expect(sentEmail.html).toContain('border-radius: 10px');
      expect(sentEmail.html).toContain(
        'box-shadow: 0 2px 10px rgba(0,0,0,0.1)',
      );

      // Check for branding
      expect(sentEmail.html).toContain('XScan');
      expect(sentEmail.from).toBe('noreply@xscan.com');
    });

    it('should include security notices where appropriate', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const token = 'test-token';

      await service.sendPasswordReset(email, token, username);

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];

      // Check for security notices
      expect(sentEmail.html).toContain('Security Notice');
      expect(sentEmail.html).toContain('expire in 1 hour');
      expect(sentEmail.html).toContain(
        "If you didn't request a password reset",
      );
    });
  });
});
