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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const aws_s3_service_1 = require("../../common/services/aws-s3.service");
const media_processing_service_1 = require("../../common/services/media-processing.service");
const multer_1 = require("multer");
let MediaUploadController = class MediaUploadController {
    constructor(s3Service, mediaProcessingService) {
        this.s3Service = s3Service;
        this.mediaProcessingService = mediaProcessingService;
    }
    async uploadMedia(file, body, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!req.user?.id) {
            throw new common_1.BadRequestException('User ID not found');
        }
        try {
            const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const mediaFile = {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                data: base64Data,
            };
            const processedMedia = await this.mediaProcessingService.processSingleFile(mediaFile, req.user.id);
            const response = {
                success: true,
                data: {
                    url: processedMedia.url,
                    s3Key: processedMedia.s3Key,
                    name: processedMedia.name,
                    type: processedMedia.type,
                    size: processedMedia.size,
                },
            };
            console.log('✅ Media upload successful:', response);
            return response;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Upload failed: ${error.message}`);
        }
    }
    async uploadMultipleMedia(files, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        if (!req.user?.id) {
            throw new common_1.BadRequestException('User ID not found');
        }
        try {
            const mediaFiles = files.map(file => ({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                data: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            }));
            const processedMedia = await this.mediaProcessingService.processMediaFiles(mediaFiles, req.user.id);
            return {
                success: true,
                data: processedMedia.map(media => ({
                    url: media.url,
                    s3Key: media.s3Key,
                    name: media.name,
                    type: media.type,
                    size: media.size,
                })),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Upload failed: ${error.message}`);
        }
    }
};
exports.MediaUploadController = MediaUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "uploadMultipleMedia", null);
exports.MediaUploadController = MediaUploadController = __decorate([
    (0, common_1.Controller)('obs-settings/media'),
    __metadata("design:paramtypes", [aws_s3_service_1.AwsS3Service,
        media_processing_service_1.MediaProcessingService])
], MediaUploadController);
//# sourceMappingURL=media-upload.controller.js.map