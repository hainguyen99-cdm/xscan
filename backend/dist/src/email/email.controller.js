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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    getEmailStatus() {
        return this.emailService.getEmailStatus();
    }
    async testConnection() {
        const isConnected = await this.emailService.testConnection();
        return { success: isConnected };
    }
    async updateConfig(config) {
        await this.emailService.updateSmtpConfig(config);
        return { success: true, message: 'SMTP configuration updated' };
    }
    async createTestTransporter() {
        await this.emailService.createTestTransporter();
        return { success: true, message: 'Test transporter created' };
    }
    async createGmailOAuth2Transporter() {
        await this.emailService.createGmailOAuth2Transporter();
        return { success: true, message: 'Gmail OAuth2 transporter created' };
    }
    async sendTestEmail(testData) {
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
    enableEmailService() {
        this.emailService.setEmailEnabled(true);
        return { success: true, message: 'Email service enabled' };
    }
    disableEmailService() {
        this.emailService.setEmailEnabled(false);
        return { success: true, message: 'Email service disabled' };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "getEmailStatus", null);
__decorate([
    (0, common_1.Post)('test-connection'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Put)('config'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('test-transporter'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "createTestTransporter", null);
__decorate([
    (0, common_1.Post)('gmail-oauth2'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "createGmailOAuth2Transporter", null);
__decorate([
    (0, common_1.Post)('test-email'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTestEmail", null);
__decorate([
    (0, common_1.Post)('enable'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "enableEmailService", null);
__decorate([
    (0, common_1.Post)('disable'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "disableEmailService", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.Controller)('email'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map