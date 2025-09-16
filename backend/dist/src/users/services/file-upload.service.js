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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
let FileUploadService = class FileUploadService {
    constructor(configService) {
        this.configService = configService;
        this.uploadDir = this.configService.uploadDir;
        this.maxFileSize = this.configService.maxFileSize;
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        this.ensureUploadDir();
    }
    ensureUploadDir() {
        const fullPath = path.join(process.cwd(), this.uploadDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }
    async uploadProfilePicture(file, userId) {
        this.validateFile(file);
        if (!file.buffer) {
            console.error('File buffer is undefined. File object:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer ? 'exists' : 'undefined',
                stream: file.stream ? 'exists' : 'undefined',
            });
            throw new common_1.BadRequestException('File buffer is missing. Please try uploading the file again.');
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = `${userId}_${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const filePath = `${this.uploadDir}/profiles/${fileName}`.replace(/\\/g, '/');
        const profilesDir = path.join(process.cwd(), this.uploadDir, 'profiles');
        if (!fs.existsSync(profilesDir)) {
            fs.mkdirSync(profilesDir, { recursive: true });
        }
        const fullPath = path.join(process.cwd(), this.uploadDir, 'profiles', fileName);
        console.log('Saving file to:', fullPath, 'Buffer size:', file.buffer.length);
        fs.writeFileSync(fullPath, file.buffer);
        return filePath;
    }
    async uploadCoverPhoto(file, userId) {
        this.validateFile(file);
        if (!file.buffer) {
            console.error('File buffer is undefined. File object:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer ? 'exists' : 'undefined',
                stream: file.stream ? 'exists' : 'undefined',
            });
            throw new common_1.BadRequestException('File buffer is missing. Please try uploading the file again.');
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = `${userId}_cover_${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const filePath = `${this.uploadDir}/covers/${fileName}`.replace(/\\/g, '/');
        const coversDir = path.join(process.cwd(), this.uploadDir, 'covers');
        if (!fs.existsSync(coversDir)) {
            fs.mkdirSync(coversDir, { recursive: true });
        }
        const fullPath = path.join(process.cwd(), this.uploadDir, 'covers', fileName);
        console.log('Saving cover photo to:', fullPath, 'Buffer size:', file.buffer.length);
        fs.writeFileSync(fullPath, file.buffer);
        return filePath;
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
    }
    async deleteProfilePicture(filePath) {
        if (!filePath)
            return;
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
    getProfilePictureUrl(filePath) {
        if (!filePath)
            return null;
        const baseUrl = this.configService.baseUrl;
        const cleanPath = filePath.replace(/\\/g, '/');
        const fullUrl = `${baseUrl}/${cleanPath}`;
        console.log('FileUploadService: generated URL:', fullUrl);
        return fullUrl;
    }
    getCoverPhotoUrl(filePath) {
        if (!filePath)
            return null;
        const baseUrl = this.configService.baseUrl;
        const cleanPath = filePath.replace(/\\/g, '/');
        const fullUrl = `${baseUrl}/${cleanPath}`;
        console.log('FileUploadService: generated cover photo URL:', fullUrl);
        return fullUrl;
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map