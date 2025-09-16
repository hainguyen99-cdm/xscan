import { ConfigService } from '../../config/config.service';
export declare class FileUploadService {
    private configService;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(configService: ConfigService);
    private ensureUploadDir;
    uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string>;
    uploadCoverPhoto(file: Express.Multer.File, userId: string): Promise<string>;
    private validateFile;
    deleteProfilePicture(filePath: string): Promise<void>;
    getProfilePictureUrl(filePath: string): string;
    getCoverPhotoUrl(filePath: string): string;
}
