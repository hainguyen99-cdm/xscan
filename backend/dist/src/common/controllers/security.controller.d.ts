import { ContentScannerService, ScanResult } from '../services/content-scanner.service';
import { TokenizationService, WidgetToken } from '../services/tokenization.service';
import { PCIComplianceService, PaymentCardData, TokenizedCardData } from '../services/pci-compliance.service';
import { CommonService } from '../services/common.service';
export declare class SecurityController {
    private readonly contentScannerService;
    private readonly tokenizationService;
    private readonly pciComplianceService;
    private readonly commonService;
    constructor(contentScannerService: ContentScannerService, tokenizationService: TokenizationService, pciComplianceService: PCIComplianceService, commonService: CommonService);
    getSecurityConfig(): any;
    scanFile(body: {
        filePath: string;
        originalName: string;
    }): Promise<ScanResult>;
    createWidgetToken(body: {
        streamerId: string;
        permissions?: string[];
        metadata?: Record<string, any>;
        expiresIn?: number;
    }): Promise<WidgetToken>;
    validateWidgetToken(body: {
        token: string;
    }): Promise<{
        isValid: boolean;
        token: {
            streamerId: string;
            expiresAt: Date;
            permissions: string[];
            metadata: Record<string, any>;
        };
    }>;
    createDonationLinkToken(body: {
        streamerId: string;
        amount?: number;
        message?: string;
        expiresIn?: number;
    }): Promise<{
        token: string;
    }>;
    validateDonationLinkToken(body: {
        token: string;
    }): Promise<{
        isValid: boolean;
        data: any;
    }>;
    validatePaymentCard(cardData: PaymentCardData): Promise<import("../services/pci-compliance.service").PCIValidationResult>;
    tokenizePaymentCard(cardData: PaymentCardData): Promise<TokenizedCardData>;
    createPaymentToken(body: {
        amount: number;
        currency: string;
        streamerId: string;
        donorId?: string;
        metadata?: Record<string, any>;
        expiresIn?: number;
    }): Promise<{
        token: string;
    }>;
    generatePCIComplianceReport(): Promise<any>;
    auditPaymentProcessing(): Promise<any>;
    encryptData(body: {
        data: any;
        secretKey?: string;
    }): Promise<{
        encrypted: string;
    }>;
    decryptData(body: {
        encryptedData: string;
    }): Promise<{
        decrypted: any;
    }>;
    hashData(body: {
        data: string;
        salt?: string;
    }): Promise<{
        hash: string;
        salt: string;
    }>;
    verifyHash(body: {
        data: string;
        hash: string;
        salt: string;
    }): Promise<{
        isValid: boolean;
    }>;
    validateInput(body: {
        input: string;
        type: 'email' | 'url' | 'general';
    }): Promise<{
        original: string;
        sanitized: string;
        isValid: boolean;
        threats: {
            sqlInjection: boolean;
            xss: boolean;
        };
    }>;
}
