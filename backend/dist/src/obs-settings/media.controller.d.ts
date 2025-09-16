import { Response } from 'express';
import { MediaUploadService } from '../common/services/media-upload.service';
import { MediaUploadResponseDto, MediaDeleteRequestDto, MediaValidationDto } from './dto/media-upload.dto';
export declare class MediaController {
    private readonly mediaUploadService;
    private readonly logger;
    constructor(mediaUploadService: MediaUploadService);
    uploadMedia(streamerId: string, file: Express.Multer.File, mediaType: string): Promise<MediaUploadResponseDto>;
    deleteMedia(deleteRequest: MediaDeleteRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMediaInfo(filename: string, mediaType: string): Promise<MediaUploadResponseDto | null>;
    getValidationRules(): Promise<{
        image: MediaValidationDto;
        video: MediaValidationDto;
        audio: MediaValidationDto;
    }>;
    serveMedia(mediaType: string, filename: string, res: Response): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        service: string;
    }>;
}
