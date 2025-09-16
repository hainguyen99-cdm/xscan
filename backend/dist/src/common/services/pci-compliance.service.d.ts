import { ConfigService } from '../../config/config.service';
export interface PaymentCardData {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
}
export interface TokenizedCardData {
    token: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
    cardType: string;
    tokenizedAt: Date;
}
export interface PCIValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    complianceLevel: 'PCI_DSS_4_0' | 'PCI_DSS_3_2_1' | 'NON_COMPLIANT';
}
export declare class PCIComplianceService {
    private readonly configService;
    private readonly logger;
    private readonly cardPatterns;
    constructor(configService: ConfigService);
    validatePaymentCard(cardData: PaymentCardData): PCIValidationResult;
    tokenizeCardData(cardData: PaymentCardData): Promise<TokenizedCardData>;
    retrieveTokenizedData(token: string): Promise<TokenizedCardData | null>;
    private validateCardNumber;
    private validateExpiryDate;
    private validateCVV;
    private validateCardholderName;
    private luhnCheck;
    private getCardType;
    private isTestCard;
    private isProductionEnvironment;
    private generateSecureToken;
    private storeTokenizedData;
    private getStoredTokenizedData;
    generateComplianceReport(): Promise<any>;
    auditPaymentProcessing(): Promise<any>;
}
