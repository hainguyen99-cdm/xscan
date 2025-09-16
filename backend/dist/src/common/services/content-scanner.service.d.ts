import { ConfigService } from '../../config/config.service';
export interface ScanResult {
    isSafe: boolean;
    threats: string[];
    fileType: string;
    fileSize: number;
    hash: string;
    scanTimestamp: Date;
}
export interface FileValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class ContentScannerService {
    private readonly configService;
    private readonly logger;
    private readonly allowedMimeTypes;
    private readonly maxFileSize;
    private readonly dangerousExtensions;
    constructor(configService: ConfigService);
    scanFile(filePath: string, originalName: string): Promise<ScanResult>;
    private validateFile;
    private detectMimeType;
    private calculateFileHash;
    private validateFileHeader;
    private analyzeImageContent;
    private analyzeVideoContent;
    quarantineFile(filePath: string, reason: string): Promise<void>;
}
