"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const util_1 = require("util");
const writeFileAsync = (0, util_1.promisify)(fs.writeFile);
const mkdirAsync = (0, util_1.promisify)(fs.mkdir);
const statAsync = (0, util_1.promisify)(fs.stat);
let MediaUploadService = MediaUploadService_1 = class MediaUploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MediaUploadService_1.name);
        this.uploadDir = 'uploads';
        this.cdnBaseUrl = 'http://localhost:3000';
        this.ensureUploadDirectory();
    }
    get imageRules() {
        return {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            maxDimensions: { width: 1920, height: 1080 },
        };
    }
    get videoRules() {
        return {
            maxSize: 50 * 1024 * 1024,
            allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
            maxDuration: 10,
            maxDimensions: { width: 1920, height: 1080 },
        };
    }
    get audioRules() {
        return {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
            maxDuration: 5,
        };
    }
    async ensureUploadDirectory() {
        try {
            await mkdirAsync(this.uploadDir, { recursive: true });
            await mkdirAsync(path.join(this.uploadDir, 'images'), { recursive: true });
            await mkdirAsync(path.join(this.uploadDir, 'videos'), { recursive: true });
            await mkdirAsync(path.join(this.uploadDir, 'audio'), { recursive: true });
            await mkdirAsync(path.join(this.uploadDir, 'temp'), { recursive: true });
        }
        catch (error) {
            this.logger.error(`Failed to create upload directories: ${error.message}`);
        }
    }
    async uploadMedia(file, streamerId) {
        try {
            const validationResult = await this.validateMediaFile(file);
            if (!validationResult.isValid) {
                throw new common_1.BadRequestException(validationResult.errors.join(', '));
            }
            const mediaType = this.determineMediaType(file.mimetype);
            const filename = this.generateUniqueFilename(file.originalname, streamerId);
            const filePath = await this.saveMediaFile(file, filename, mediaType);
            const processedMedia = await this.processMedia(filePath, mediaType, file);
            const cdnUrl = this.generateCdnUrl(filename, mediaType);
            await this.cleanupTempFiles(filePath);
            return {
                filename,
                originalName: file.originalname,
                url: cdnUrl,
                type: mediaType,
                size: file.size,
                dimensions: processedMedia.dimensions,
                duration: processedMedia.duration,
                mimeType: file.mimetype,
            };
        }
        catch (error) {
            this.logger.error(`Media upload failed: ${error.message}`);
            throw error;
        }
    }
    async validateMediaFile(file) {
        const errors = [];
        if (file.size > this.imageRules.maxSize) {
            errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size`);
        }
        const mediaType = this.determineMediaType(file.mimetype);
        let rules;
        switch (mediaType) {
            case 'image':
            case 'gif':
                rules = this.imageRules;
                break;
            case 'video':
                rules = this.videoRules;
                break;
            case 'audio':
                rules = this.audioRules;
                break;
            default:
                errors.push('Unsupported file type');
                return { isValid: false, errors };
        }
        if (!rules.allowedTypes.includes(file.mimetype)) {
            errors.push(`File type ${file.mimetype} is not allowed`);
        }
        if (mediaType === 'video' || mediaType === 'audio') {
            try {
                const duration = await this.getMediaDuration(file.buffer, file.mimetype);
                if (duration > rules.maxDuration) {
                    errors.push(`Duration ${duration}s exceeds maximum allowed duration of ${rules.maxDuration}s`);
                }
            }
            catch (error) {
                this.logger.warn(`Could not determine media duration: ${error.message}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    determineMediaType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return mimeType === 'image/gif' ? 'gif' : 'image';
        }
        if (mimeType.startsWith('video/')) {
            return 'video';
        }
        if (mimeType.startsWith('audio/')) {
            return 'audio';
        }
        throw new common_1.BadRequestException(`Unsupported MIME type: ${mimeType}`);
    }
    generateUniqueFilename(originalName, streamerId) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        return `${streamerId}_${baseName}_${timestamp}_${randomString}${extension}`;
    }
    async saveMediaFile(file, filename, mediaType) {
        let subDir;
        switch (mediaType) {
            case 'image':
            case 'gif':
                subDir = 'images';
                break;
            case 'video':
                subDir = 'videos';
                break;
            case 'audio':
                subDir = 'audio';
                break;
            default:
                subDir = 'temp';
        }
        const filePath = path.join(this.uploadDir, subDir, filename);
        try {
            await writeFileAsync(filePath, file.buffer);
            this.logger.log(`File saved to: ${filePath}`);
            return filePath;
        }
        catch (error) {
            this.logger.error(`Failed to save file: ${error.message}`);
            throw new common_1.BadRequestException('Failed to save uploaded file');
        }
    }
    async processMedia(filePath, mediaType, originalFile) {
        const result = {};
        try {
            if (mediaType === 'image' || mediaType === 'gif') {
                result.dimensions = await this.getImageDimensions(filePath);
            }
            else if (mediaType === 'video') {
                result.dimensions = await this.getVideoDimensions(filePath);
                result.duration = await this.getVideoDuration(filePath);
            }
            else if (mediaType === 'audio') {
                result.duration = await this.getAudioDuration(filePath);
            }
        }
        catch (error) {
            this.logger.warn(`Media processing failed: ${error.message}`);
        }
        return result;
    }
    async getImageDimensions(filePath) {
        return { width: 300, height: 200 };
    }
    async getVideoDimensions(filePath) {
        return { width: 640, height: 480 };
    }
    async getVideoDuration(filePath) {
        return 5;
    }
    async getAudioDuration(filePath) {
        return 3;
    }
    async getMediaDuration(buffer, mimeType) {
        if (mimeType.startsWith('video/')) {
            return 5;
        }
        if (mimeType.startsWith('audio/')) {
            return 3;
        }
        return 0;
    }
    generateCdnUrl(filename, mediaType) {
        let subDir;
        switch (mediaType) {
            case 'image':
            case 'gif':
                subDir = 'images';
                break;
            case 'video':
                subDir = 'videos';
                break;
            case 'audio':
                subDir = 'audio';
                break;
            default:
                subDir = 'temp';
        }
        return `${this.cdnBaseUrl}/media/${subDir}/${filename}`;
    }
    async cleanupTempFiles(filePath) {
        try {
            const tempDir = path.join(this.uploadDir, 'temp');
            if (filePath.startsWith(tempDir)) {
                await fs.promises.unlink(filePath);
                this.logger.log(`Temporary file cleaned up: ${filePath}`);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to cleanup temp file: ${error.message}`);
        }
    }
    async deleteMedia(filename, mediaType) {
        try {
            let subDir;
            switch (mediaType) {
                case 'image':
                case 'gif':
                    subDir = 'images';
                    break;
                case 'video':
                    subDir = 'videos';
                    break;
                case 'audio':
                    subDir = 'audio';
                    break;
                default:
                    subDir = 'temp';
            }
            const filePath = path.join(this.uploadDir, subDir, filename);
            if (await this.fileExists(filePath)) {
                await fs.promises.unlink(filePath);
                this.logger.log(`Media file deleted: ${filePath}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to delete media file: ${error.message}`);
            return false;
        }
    }
    async fileExists(filePath) {
        try {
            await statAsync(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async getMediaInfo(filename, mediaType) {
        try {
            let subDir;
            switch (mediaType) {
                case 'image':
                case 'gif':
                    subDir = 'images';
                    break;
                case 'video':
                    subDir = 'videos';
                    break;
                case 'audio':
                    subDir = 'audio';
                    break;
                default:
                    subDir = 'temp';
            }
            const filePath = path.join(this.uploadDir, subDir, filename);
            if (!(await this.fileExists(filePath))) {
                return null;
            }
            const stats = await statAsync(filePath);
            const cdnUrl = this.generateCdnUrl(filename, mediaType);
            return {
                filename,
                originalName: filename,
                url: cdnUrl,
                type: mediaType,
                size: stats.size,
                mimeType: this.getMimeTypeFromExtension(path.extname(filename)),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get media info: ${error.message}`);
            return null;
        }
    }
    getMimeTypeFromExtension(extension) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
    getValidationRules() {
        return {
            image: this.imageRules,
            video: this.videoRules,
            audio: this.audioRules,
        };
    }
};
exports.MediaUploadService = MediaUploadService;
exports.MediaUploadService = MediaUploadService = MediaUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], MediaUploadService);
//# sourceMappingURL=media-upload.service.js.map