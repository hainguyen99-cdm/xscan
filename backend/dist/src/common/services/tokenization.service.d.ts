import { ConfigService } from '../../config/config.service';
export interface TokenizedData {
    token: string;
    expiresAt: Date;
    data: any;
}
export interface WidgetToken {
    token: string;
    streamerId: string;
    expiresAt: Date;
    permissions: string[];
    metadata: Record<string, any>;
}
export declare class TokenizationService {
    private readonly configService;
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    constructor(configService: ConfigService);
    private generateKey;
    private generateIV;
    encryptData(data: any, secretKey?: string): Promise<string>;
    decryptData(encryptedData: string): Promise<any>;
    createWidgetToken(streamerId: string, permissions?: string[], metadata?: Record<string, any>, expiresIn?: number): Promise<WidgetToken>;
    validateWidgetToken(token: string): Promise<WidgetToken | null>;
    createDonationLinkToken(streamerId: string, amount?: number, message?: string, expiresIn?: number): Promise<string>;
    validateDonationLinkToken(token: string): Promise<any>;
    createPaymentToken(paymentData: {
        amount: number;
        currency: string;
        streamerId: string;
        donorId?: string;
        metadata?: Record<string, any>;
    }, expiresIn?: number): Promise<string>;
    validatePaymentToken(token: string): Promise<any>;
    generateSecureToken(length?: number): string;
    hashData(data: string, salt?: string): {
        hash: string;
        salt: string;
    };
    verifyHash(data: string, hash: string, salt: string): boolean;
    createSessionToken(userId: string, permissions?: string[], expiresIn?: number): Promise<string>;
    revokeToken(token: string, reason?: string): Promise<void>;
}
