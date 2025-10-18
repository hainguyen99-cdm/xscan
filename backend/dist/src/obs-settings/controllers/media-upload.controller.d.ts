import { AwsS3Service } from '../../common/services/aws-s3.service';
import { MediaProcessingService } from '../../common/services/media-processing.service';
export declare class MediaUploadController {
    private readonly s3Service;
    private readonly mediaProcessingService;
    constructor(s3Service: AwsS3Service, mediaProcessingService: MediaProcessingService);
    uploadMedia(file: Express.Multer.File, body: {
        mediaType: string;
    }, req: any): Promise<{
        success: boolean;
        data: {
            url: string;
            s3Key: string;
            name: string;
            type: string;
            size: number;
        };
    }>;
    uploadMultipleMedia(files: Express.Multer.File[], req: any): Promise<{
        success: boolean;
        data: {
            url: string;
            s3Key: string;
            name: string;
            type: string;
            size: number;
        }[];
    }>;
}
