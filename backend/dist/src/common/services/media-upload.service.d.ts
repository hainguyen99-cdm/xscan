import { ConfigService } from '../../config/config.service';
export interface MediaFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export interface ProcessedMedia {
    filename: string;
    originalName: string;
    url: string;
    type: 'image' | 'gif' | 'video' | 'audio';
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    mimeType: string;
}
export interface MediaValidationRules {
    maxSize: number;
    allowedTypes: string[];
    maxDuration?: number;
    maxDimensions?: {
        width: number;
        height: number;
    };
}
export declare class MediaUploadService {
    private configService;
    private readonly logger;
    private readonly uploadDir;
    private readonly cdnBaseUrl;
    private readonly config;
    constructor(configService: ConfigService);
    private get imageRules();
    private get videoRules();
    private get audioRules();
    private ensureUploadDirectory;
    uploadMedia(file: MediaFile, streamerId: string): Promise<ProcessedMedia>;
    private validateMediaFile;
    private determineMediaType;
    private generateUniqueFilename;
    private saveMediaFile;
    private processMedia;
    private getImageDimensions;
    private getVideoDimensions;
    private getVideoDuration;
    private getAudioDuration;
    private getMediaDuration;
    private generateCdnUrl;
    private cleanupTempFiles;
    deleteMedia(filename: string, mediaType: string): Promise<boolean>;
    private fileExists;
    getMediaInfo(filename: string, mediaType: string): Promise<ProcessedMedia | null>;
    private getMimeTypeFromExtension;
    getValidationRules(): {
        image: MediaValidationRules;
        video: MediaValidationRules;
        audio: MediaValidationRules;
    };
}
