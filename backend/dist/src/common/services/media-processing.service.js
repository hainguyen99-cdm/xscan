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
var MediaProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaProcessingService = void 0;
const common_1 = require("@nestjs/common");
const aws_s3_service_1 = require("./aws-s3.service");
let MediaProcessingService = MediaProcessingService_1 = class MediaProcessingService {
    constructor(s3Service) {
        this.s3Service = s3Service;
        this.logger = new common_1.Logger(MediaProcessingService_1.name);
    }
    async processMediaFiles(mediaFiles, userId) {
        const processedFiles = [];
        for (const file of mediaFiles) {
            try {
                const processed = await this.processSingleFile(file, userId);
                processedFiles.push(processed);
            }
            catch (error) {
                this.logger.error(`Failed to process file ${file.name}: ${error.message}`);
                throw error;
            }
        }
        return processedFiles;
    }
    async processSingleFile(file, userId) {
        try {
            const fileExtension = this.getFileExtension(file.name);
            const cleanFileName = this.generateCleanFileName(file.name, fileExtension);
            const s3Result = await this.s3Service.uploadFile(file.data, cleanFileName, file.type, userId);
            return {
                name: file.name,
                type: file.type,
                size: file.size,
                url: s3Result.url,
                s3Key: s3Result.key,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process file ${file.name}: ${error.message}`);
            throw error;
        }
    }
    extractMediaFiles(configuration) {
        const mediaFiles = [];
        if (configuration.imageSettings?.url && this.isBase64DataUrl(configuration.imageSettings.url)) {
            mediaFiles.push({
                name: `image_${Date.now()}.${this.getExtensionFromMimeType(configuration.imageSettings.mediaType)}`,
                type: this.getMimeTypeFromDataUrl(configuration.imageSettings.url),
                size: this.getBase64Size(configuration.imageSettings.url),
                data: configuration.imageSettings.url,
            });
        }
        if (configuration.soundSettings?.url && this.isBase64DataUrl(configuration.soundSettings.url)) {
            mediaFiles.push({
                name: `sound_${Date.now()}.${this.getExtensionFromMimeType(configuration.soundSettings.mediaType)}`,
                type: this.getMimeTypeFromDataUrl(configuration.soundSettings.url),
                size: this.getBase64Size(configuration.soundSettings.url),
                data: configuration.soundSettings.url,
            });
        }
        return mediaFiles;
    }
    replaceMediaUrlsInConfiguration(configuration, processedMedia) {
        const updatedConfig = { ...configuration };
        if (updatedConfig.imageSettings?.url && this.isBase64DataUrl(updatedConfig.imageSettings.url)) {
            const imageMedia = processedMedia.find(m => m.type.startsWith('image/'));
            if (imageMedia) {
                updatedConfig.imageSettings.url = imageMedia.url;
                updatedConfig.imageSettings.s3Key = imageMedia.s3Key;
            }
        }
        if (updatedConfig.soundSettings?.url && this.isBase64DataUrl(updatedConfig.soundSettings.url)) {
            const soundMedia = processedMedia.find(m => m.type.startsWith('audio/'));
            if (soundMedia) {
                updatedConfig.soundSettings.url = soundMedia.url;
                updatedConfig.soundSettings.s3Key = soundMedia.s3Key;
            }
        }
        return updatedConfig;
    }
    async cleanupOldMediaFiles(oldConfiguration, newConfiguration) {
        const oldS3Keys = [];
        const newS3Keys = [];
        if (oldConfiguration.imageSettings?.s3Key) {
            oldS3Keys.push(oldConfiguration.imageSettings.s3Key);
        }
        if (oldConfiguration.soundSettings?.s3Key) {
            oldS3Keys.push(oldConfiguration.soundSettings.s3Key);
        }
        if (newConfiguration.imageSettings?.s3Key) {
            newS3Keys.push(newConfiguration.imageSettings.s3Key);
        }
        if (newConfiguration.soundSettings?.s3Key) {
            newS3Keys.push(newConfiguration.soundSettings.s3Key);
        }
        const keysToDelete = oldS3Keys.filter(key => !newS3Keys.includes(key));
        for (const key of keysToDelete) {
            try {
                await this.s3Service.deleteFile(key);
                this.logger.log(`Cleaned up old media file: ${key}`);
            }
            catch (error) {
                this.logger.warn(`Failed to delete old media file ${key}: ${error.message}`);
            }
        }
    }
    isBase64DataUrl(str) {
        return str && str.startsWith('data:') && str.includes('base64,');
    }
    getMimeTypeFromDataUrl(dataUrl) {
        const match = dataUrl.match(/^data:([^;]+);base64,/);
        return match ? match[1] : 'application/octet-stream';
    }
    getExtensionFromMimeType(mediaType) {
        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'audio/mpeg': 'mp3',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav',
            'audio/ogg': 'ogg',
        };
        return mimeToExt[mediaType] || 'bin';
    }
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : '';
    }
    generateCleanFileName(originalName, extension) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${timestamp}_${randomSuffix}.${extension}`;
    }
    getBase64Size(dataUrl) {
        const base64Data = dataUrl.split(',')[1];
        return Math.round((base64Data.length * 3) / 4);
    }
};
exports.MediaProcessingService = MediaProcessingService;
exports.MediaProcessingService = MediaProcessingService = MediaProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [aws_s3_service_1.AwsS3Service])
], MediaProcessingService);
//# sourceMappingURL=media-processing.service.js.map