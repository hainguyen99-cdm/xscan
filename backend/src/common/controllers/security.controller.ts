import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ContentScannerService, ScanResult } from '../services/content-scanner.service';
import { TokenizationService, WidgetToken } from '../services/tokenization.service';
import { PCIComplianceService, PaymentCardData, TokenizedCardData } from '../services/pci-compliance.service';
import { CommonService } from '../services/common.service';
import { ScanResultDto } from '../dto/scan-result.dto';
import { WidgetTokenDto } from '../dto/widget-token.dto';
import { TokenizedCardDataDto } from '../dto/tokenized-card-data.dto';

@ApiTags('security')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly contentScannerService: ContentScannerService,
    private readonly tokenizationService: TokenizationService,
    private readonly pciComplianceService: PCIComplianceService,
    private readonly commonService: CommonService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'Get security configuration' })
  @ApiResponse({ status: 200, description: 'Security configuration retrieved successfully' })
  getSecurityConfig() {
    return this.commonService.getSecurityConfig();
  }

  @Post('scan-file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scan uploaded file for security threats' })
  @ApiResponse({ status: 200, description: 'File scanned successfully', type: ScanResultDto })
  @ApiResponse({ status: 400, description: 'Invalid file or scan failed' })
  async scanFile(@Body() body: { filePath: string; originalName: string }): Promise<ScanResult> {
    this.commonService.logSecurityEvent('file_scan_requested', body);
    
    try {
      const result = await this.contentScannerService.scanFile(body.filePath, body.originalName);
      
      if (!result.isSafe) {
        this.commonService.logSecurityEvent('threat_detected', result, 'warn');
        // Quarantine the file if threats are detected
        await this.contentScannerService.quarantineFile(body.filePath, result.threats.join(', '));
      }
      
      return result;
    } catch (error) {
      this.commonService.logSecurityEvent('file_scan_failed', { error: error.message }, 'error');
      throw error;
    }
  }

  @Post('create-widget-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create secure widget token for OBS integration' })
  @ApiResponse({ status: 201, description: 'Widget token created successfully', type: WidgetTokenDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createWidgetToken(
    @Body() body: {
      streamerId: string;
      permissions?: string[];
      metadata?: Record<string, any>;
      expiresIn?: number;
    }
  ): Promise<WidgetToken> {
    this.commonService.logSecurityEvent('widget_token_created', { streamerId: body.streamerId });
    
    return this.tokenizationService.createWidgetToken(
      body.streamerId,
      body.permissions || ['read'],
      body.metadata || {},
      body.expiresIn || 24 * 60 * 60
    );
  }

  @Post('validate-widget-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate widget token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async validateWidgetToken(@Body() body: { token: string }) {
    this.commonService.logSecurityEvent('widget_token_validated', { token: body.token.substring(0, 10) + '...' });
    
    const result = await this.tokenizationService.validateWidgetToken(body.token);
    return {
      isValid: !!result,
      token: result ? {
        streamerId: result.streamerId,
        expiresAt: result.expiresAt,
        permissions: result.permissions,
        metadata: result.metadata
      } : null
    };
  }

  @Post('create-donation-link-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create secure donation link token' })
  @ApiResponse({ status: 201, description: 'Donation link token created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createDonationLinkToken(
    @Body() body: {
      streamerId: string;
      amount?: number;
      message?: string;
      expiresIn?: number;
    }
  ) {
    this.commonService.logSecurityEvent('donation_link_token_created', { streamerId: body.streamerId });
    
    const token = await this.tokenizationService.createDonationLinkToken(
      body.streamerId,
      body.amount,
      body.message,
      body.expiresIn || 7 * 24 * 60 * 60
    );

    return { token };
  }

  @Post('validate-donation-link-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate donation link token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async validateDonationLinkToken(@Body() body: { token: string }) {
    this.commonService.logSecurityEvent('donation_link_token_validated', { token: body.token.substring(0, 10) + '...' });
    
    const result = await this.tokenizationService.validateDonationLinkToken(body.token);
    return {
      isValid: !!result,
      data: result
    };
  }

  @Post('validate-payment-card')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate payment card data for PCI DSS compliance' })
  @ApiResponse({ status: 200, description: 'Card validation result' })
  @ApiResponse({ status: 400, description: 'Invalid card data' })
  async validatePaymentCard(@Body() cardData: PaymentCardData) {
    this.commonService.logSecurityEvent('payment_card_validated', { cardType: 'validation_request' });
    
    return this.pciComplianceService.validatePaymentCard(cardData);
  }

  @Post('tokenize-payment-card')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tokenize payment card data for PCI DSS compliance' })
  @ApiResponse({ status: 201, description: 'Card data tokenized successfully', type: TokenizedCardDataDto })
  @ApiResponse({ status: 400, description: 'Invalid card data' })
  async tokenizePaymentCard(@Body() cardData: PaymentCardData): Promise<TokenizedCardData> {
    this.commonService.logSecurityEvent('payment_card_tokenized', { cardType: 'tokenization_request' });
    
    return this.pciComplianceService.tokenizeCardData(cardData);
  }

  @Post('create-payment-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create secure payment token' })
  @ApiResponse({ status: 201, description: 'Payment token created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createPaymentToken(
    @Body() body: {
      amount: number;
      currency: string;
      streamerId: string;
      donorId?: string;
      metadata?: Record<string, any>;
      expiresIn?: number;
    }
  ) {
    this.commonService.logSecurityEvent('payment_token_created', { 
      streamerId: body.streamerId,
      amount: body.amount,
      currency: body.currency
    });
    
    const token = await this.tokenizationService.createPaymentToken(
      {
        amount: body.amount,
        currency: body.currency,
        streamerId: body.streamerId,
        donorId: body.donorId,
        metadata: body.metadata
      },
      body.expiresIn || 15 * 60
    );

    return { token };
  }

  @Get('pci-compliance-report')
  @ApiOperation({ summary: 'Generate PCI DSS compliance report' })
  @ApiResponse({ status: 200, description: 'Compliance report generated successfully' })
  async generatePCIComplianceReport() {
    this.commonService.logSecurityEvent('pci_compliance_report_generated', {});
    
    return this.pciComplianceService.generateComplianceReport();
  }

  @Get('audit-payment-processing')
  @ApiOperation({ summary: 'Audit payment processing for compliance' })
  @ApiResponse({ status: 200, description: 'Payment processing audit completed' })
  async auditPaymentProcessing() {
    this.commonService.logSecurityEvent('payment_processing_audit_requested', {});
    
    return this.pciComplianceService.auditPaymentProcessing();
  }

  @Post('encrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt sensitive data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  @ApiResponse({ status: 400, description: 'Encryption failed' })
  async encryptData(@Body() body: { data: any; secretKey?: string }) {
    this.commonService.logSecurityEvent('data_encryption_requested', { dataType: typeof body.data });
    
    const encrypted = await this.tokenizationService.encryptData(body.data, body.secretKey);
    return { encrypted };
  }

  @Post('decrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt encrypted data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  @ApiResponse({ status: 400, description: 'Decryption failed' })
  async decryptData(@Body() body: { encryptedData: string }) {
    this.commonService.logSecurityEvent('data_decryption_requested', {});
    
    const decrypted = await this.tokenizationService.decryptData(body.encryptedData);
    return { decrypted };
  }

  @Post('hash-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hash sensitive data (one-way encryption)' })
  @ApiResponse({ status: 200, description: 'Data hashed successfully' })
  async hashData(@Body() body: { data: string; salt?: string }) {
    this.commonService.logSecurityEvent('data_hashing_requested', {});
    
    const result = this.tokenizationService.hashData(body.data, body.salt);
    return result;
  }

  @Post('verify-hash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify hashed data' })
  @ApiResponse({ status: 200, description: 'Hash verification completed' })
  async verifyHash(@Body() body: { data: string; hash: string; salt: string }) {
    this.commonService.logSecurityEvent('hash_verification_requested', {});
    
    const isValid = this.tokenizationService.verifyHash(body.data, body.hash, body.salt);
    return { isValid };
  }

  @Post('input-validation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and sanitize input data' })
  @ApiResponse({ status: 200, description: 'Input validation completed' })
  async validateInput(@Body() body: { input: string; type: 'email' | 'url' | 'general' }) {
    this.commonService.logSecurityEvent('input_validation_requested', { type: body.type });
    
    const sanitized = this.commonService.sanitizeInput(body.input);
    const hasSQLInjection = this.commonService.containsSQLInjection(body.input);
    const hasXSS = this.commonService.containsXSS(body.input);
    
    let isValid = false;
    switch (body.type) {
      case 'email':
        isValid = this.commonService.validateEmail(body.input);
        break;
      case 'url':
        isValid = this.commonService.validateUrl(body.input);
        break;
      default:
        isValid = !hasSQLInjection && !hasXSS;
    }

    return {
      original: body.input,
      sanitized,
      isValid,
      threats: {
        sqlInjection: hasSQLInjection,
        xss: hasXSS
      }
    };
  }
} 