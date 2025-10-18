import { ConfigService } from '../../config/config.service';
export interface S3UploadResult {
    key: string;
    url: string;
    bucket: string;
    region: string;
}
export interface S3Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
}
export declare class AwsS3Service {
    private configService;
    private readonly logger;
    private readonly s3Client;
    private readonly config;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer | Uint8Array | string, fileName: string, contentType: string, userId: string, options?: {
        generatePresignedUrl?: boolean;
        expiresIn?: number;
    }): Promise<S3UploadResult>;
    deleteFile(key: string): Promise<void>;
    getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
    private generateS3Key;
    extractKeyFromUrl(url: string): string | null;
    isS3Url(url: string): boolean;
    getConfig(): S3Config;
    getCdnBaseUrl(): string;
    convertToCdnUrl(s3Url: string): string;
}
