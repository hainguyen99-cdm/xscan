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
var MediaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const media_upload_service_1 = require("../common/services/media-upload.service");
const media_upload_dto_1 = require("./dto/media-upload.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/enums/roles.enum");
let MediaController = MediaController_1 = class MediaController {
    constructor(mediaUploadService) {
        this.mediaUploadService = mediaUploadService;
        this.logger = new common_1.Logger(MediaController_1.name);
    }
    async uploadMedia(streamerId, file, mediaType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!mediaType) {
            throw new common_1.BadRequestException('Media type is required');
        }
        const validMediaTypes = ['image', 'gif', 'video', 'audio'];
        if (!validMediaTypes.includes(mediaType)) {
            throw new common_1.BadRequestException(`Invalid media type. Must be one of: ${validMediaTypes.join(', ')}`);
        }
        const mediaFile = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
        };
        try {
            this.logger.log(`Uploading ${mediaType} for streamer ${streamerId}: ${file.originalname}`);
            const result = await this.mediaUploadService.uploadMedia(mediaFile, streamerId);
            this.logger.log(`Media uploaded successfully: ${result.filename}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Media upload failed: ${error.message}`);
            throw error;
        }
    }
    async deleteMedia(deleteRequest) {
        try {
            this.logger.log(`Deleting media: ${deleteRequest.filename} (${deleteRequest.mediaType})`);
            const deleted = await this.mediaUploadService.deleteMedia(deleteRequest.filename, deleteRequest.mediaType);
            if (deleted) {
                this.logger.log(`Media deleted successfully: ${deleteRequest.filename}`);
                return { success: true, message: 'Media deleted successfully' };
            }
            else {
                this.logger.warn(`Media file not found: ${deleteRequest.filename}`);
                return { success: false, message: 'Media file not found' };
            }
        }
        catch (error) {
            this.logger.error(`Media deletion failed: ${error.message}`);
            throw error;
        }
    }
    async getMediaInfo(filename, mediaType) {
        if (!mediaType) {
            throw new common_1.BadRequestException('Media type is required');
        }
        try {
            this.logger.log(`Getting media info: ${filename} (${mediaType})`);
            const mediaInfo = await this.mediaUploadService.getMediaInfo(filename, mediaType);
            if (!mediaInfo) {
                this.logger.warn(`Media file not found: ${filename}`);
                return null;
            }
            return mediaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get media info: ${error.message}`);
            throw error;
        }
    }
    async getValidationRules() {
        return {
            image: {
                maxSize: 10 * 1024 * 1024,
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
                maxDimensions: { width: 1920, height: 1080 },
            },
            video: {
                maxSize: 50 * 1024 * 1024,
                allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
                maxDuration: 10,
                maxDimensions: { width: 1920, height: 1080 },
            },
            audio: {
                maxSize: 10 * 1024 * 1024,
                allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
                maxDuration: 5,
            },
        };
    }
    async serveMedia(mediaType, filename, res) {
        try {
            const validMediaTypes = ['images', 'videos', 'audio'];
            if (!validMediaTypes.includes(mediaType)) {
                res.status(common_1.HttpStatus.BAD_REQUEST).json({ error: 'Invalid media type' });
                return;
            }
            const mediaInfo = await this.mediaUploadService.getMediaInfo(filename, mediaType.slice(0, -1));
            if (!mediaInfo) {
                res.status(common_1.HttpStatus.NOT_FOUND).json({ error: 'Media file not found' });
                return;
            }
            res.setHeader('Content-Type', mediaInfo.mimeType);
            res.setHeader('Content-Length', mediaInfo.size.toString());
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const filePath = `uploads/${mediaType}/${filename}`;
            const fs = require('fs');
            if (!fs.existsSync(filePath)) {
                res.status(common_1.HttpStatus.NOT_FOUND).json({ error: 'Media file not found' });
                return;
            }
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            fileStream.on('error', (error) => {
                this.logger.error(`Error streaming media file: ${error.message}`);
                if (!res.headersSent) {
                    res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to serve media file' });
                }
            });
        }
        catch (error) {
            this.logger.error(`Error serving media: ${error.message}`);
            if (!res.headersSent) {
                res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
            }
        }
    }
    async healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'MediaUploadService',
        };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload/:streamerId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Media file to upload (image, gif, video, or audio)',
                },
                mediaType: {
                    type: 'string',
                    enum: ['image', 'gif', 'video', 'audio'],
                    description: 'Type of media being uploaded',
                },
            },
            required: ['file', 'mediaType'],
        },
    }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'ID of the streamer' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Media uploaded successfully',
        type: media_upload_dto_1.MediaUploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid file or validation error',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 413,
        description: 'File too large',
    }),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('mediaType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Delete)('delete'),
    (0, swagger_1.ApiBody)({ type: media_upload_dto_1.MediaDeleteRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Media file not found',
    }),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_upload_dto_1.MediaDeleteRequestDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Get)('info/:filename'),
    (0, swagger_1.ApiParam)({ name: 'filename', description: 'Name of the media file' }),
    (0, swagger_1.ApiQuery)({ name: 'mediaType', enum: ['image', 'gif', 'video', 'audio'], description: 'Type of media' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media information retrieved successfully',
        type: media_upload_dto_1.MediaUploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Media file not found',
    }),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Query)('mediaType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMediaInfo", null);
__decorate([
    (0, common_1.Get)('validation-rules'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media validation rules retrieved successfully',
        type: [media_upload_dto_1.MediaValidationDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.STREAMER, roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getValidationRules", null);
__decorate([
    (0, common_1.Get)('serve/:mediaType/:filename'),
    (0, swagger_1.ApiParam)({ name: 'mediaType', enum: ['images', 'videos', 'audio'], description: 'Type of media directory' }),
    (0, swagger_1.ApiParam)({ name: 'filename', description: 'Name of the media file' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media file served successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Media file not found',
    }),
    __param(0, (0, common_1.Param)('mediaType')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "serveMedia", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media service health check',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "healthCheck", null);
exports.MediaController = MediaController = MediaController_1 = __decorate([
    (0, swagger_1.ApiTags)('Media Upload'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [media_upload_service_1.MediaUploadService])
], MediaController);
//# sourceMappingURL=media.controller.js.map