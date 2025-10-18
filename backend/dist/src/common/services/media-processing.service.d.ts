import { AwsS3Service } from './aws-s3.service';
export interface MediaFile {
    name: string;
    type: string;
    size: number;
    data: string;
}
export interface ProcessedMedia {
    name: string;
    type: string;
    size: number;
    url: string;
    s3Key: string;
}
export declare class MediaProcessingService {
    private readonly s3Service;
    private readonly logger;
    constructor(s3Service: AwsS3Service);
    processMediaFiles(mediaFiles: MediaFile[], userId: string): Promise<ProcessedMedia[]>;
    processSingleFile(file: MediaFile, userId: string): Promise<ProcessedMedia>;
    extractMediaFiles(configuration: any): MediaFile[];
    replaceMediaUrlsInConfiguration(configuration: any, processedMedia: ProcessedMedia[]): any;
    cleanupOldMediaFiles(oldConfiguration: any, newConfiguration: any): Promise<void>;
    private isBase64DataUrl;
    private getMimeTypeFromDataUrl;
    private getExtensionFromMimeType;
    private getFileExtension;
    private generateCleanFileName;
    private getBase64Size;
}
