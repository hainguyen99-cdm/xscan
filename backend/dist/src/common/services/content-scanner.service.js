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
var ContentScannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentScannerService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
let ContentScannerService = ContentScannerService_1 = class ContentScannerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ContentScannerService_1.name);
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'video/mp4',
            'video/webm',
            'video/ogg',
            'audio/mpeg',
            'audio/ogg',
            'audio/wav'
        ];
        this.maxFileSize = 10 * 1024 * 1024;
        this.dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    }
    async scanFile(filePath, originalName) {
        try {
            this.logger.log(`Scanning file: ${originalName} at ${filePath}`);
            const validation = this.validateFile(filePath, originalName);
            if (!validation.isValid) {
                throw new common_1.HttpException(`File validation failed: ${validation.errors.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const stats = fs.statSync(filePath);
            const fileType = this.detectMimeType(filePath, originalName);
            const fileHash = await this.calculateFileHash(filePath);
            if (stats.size > this.maxFileSize) {
                throw new common_1.HttpException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`, common_1.HttpStatus.PAYLOAD_TOO_LARGE);
            }
            const extension = path.extname(originalName).toLowerCase();
            if (this.dangerousExtensions.includes(extension)) {
                return {
                    isSafe: false,
                    threats: [`Dangerous file extension: ${extension}`],
                    fileType,
                    fileSize: stats.size,
                    hash: fileHash,
                    scanTimestamp: new Date()
                };
            }
            const headerValidation = await this.validateFileHeader(filePath);
            if (!headerValidation.isValid) {
                return {
                    isSafe: false,
                    threats: headerValidation.errors,
                    fileType,
                    fileSize: stats.size,
                    hash: fileHash,
                    scanTimestamp: new Date()
                };
            }
            if (fileType.startsWith('image/')) {
                const imageAnalysis = await this.analyzeImageContent(filePath);
                if (!imageAnalysis.isSafe) {
                    return {
                        isSafe: false,
                        threats: imageAnalysis.threats,
                        fileType,
                        fileSize: stats.size,
                        hash: fileHash,
                        scanTimestamp: new Date()
                    };
                }
            }
            if (fileType.startsWith('video/')) {
                const videoAnalysis = await this.analyzeVideoContent(filePath);
                if (!videoAnalysis.isSafe) {
                    return {
                        isSafe: false,
                        threats: videoAnalysis.threats,
                        fileType,
                        fileSize: stats.size,
                        hash: fileHash,
                        scanTimestamp: new Date()
                    };
                }
            }
            return {
                isSafe: true,
                threats: [],
                fileType,
                fileSize: stats.size,
                hash: fileHash,
                scanTimestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Error scanning file ${originalName}:`, error);
            throw error;
        }
    }
    validateFile(filePath, originalName) {
        const errors = [];
        const warnings = [];
        if (!fs.existsSync(filePath)) {
            errors.push('File does not exist');
        }
        if (!originalName || originalName.trim().length === 0) {
            errors.push('Invalid file name');
        }
        if (originalName.includes('\0')) {
            errors.push('Filename contains null bytes');
        }
        if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
            errors.push('Filename contains path traversal characters');
        }
        const extension = path.extname(originalName).toLowerCase();
        if (!extension) {
            warnings.push('File has no extension');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    detectMimeType(filePath, originalName) {
        const extension = path.extname(originalName).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav'
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }
    async calculateFileHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    async validateFileHeader(filePath) {
        const errors = [];
        const warnings = [];
        try {
            const buffer = Buffer.alloc(8);
            const fd = fs.openSync(filePath, 'r');
            fs.readSync(fd, buffer, 0, 8, 0);
            fs.closeSync(fd);
            const hex = buffer.toString('hex').toUpperCase();
            if (hex.startsWith('FFD8FF')) {
            }
            else if (hex.startsWith('89504E47')) {
            }
            else if (hex.startsWith('47494638')) {
            }
            else if (hex.startsWith('00000020') || hex.startsWith('00000018')) {
            }
            else if (hex.startsWith('1A45DFA3')) {
            }
            else if (hex.startsWith('FFFB') || hex.startsWith('FFFA') || hex.startsWith('FFFE')) {
            }
            else {
                warnings.push('File header does not match expected signature for declared type');
            }
        }
        catch (error) {
            errors.push('Unable to read file header');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    async analyzeImageContent(filePath) {
        const threats = [];
        try {
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            if (fileSize > 5 * 1024 * 1024) {
                threats.push('File size is unusually large for an image');
            }
            if (filePath.endsWith('.svg')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('<script') || content.includes('javascript:')) {
                    threats.push('SVG contains potentially malicious scripts');
                }
            }
        }
        catch (error) {
            threats.push('Unable to analyze image content');
        }
        return {
            isSafe: threats.length === 0,
            threats
        };
    }
    async analyzeVideoContent(filePath) {
        const threats = [];
        try {
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            if (fileSize > 100 * 1024 * 1024) {
                threats.push('Video file size exceeds reasonable limits');
            }
        }
        catch (error) {
            threats.push('Unable to analyze video content');
        }
        return {
            isSafe: threats.length === 0,
            threats
        };
    }
    async quarantineFile(filePath, reason) {
        try {
            const quarantineDir = path.join(process.cwd(), 'uploads', 'quarantine');
            if (!fs.existsSync(quarantineDir)) {
                fs.mkdirSync(quarantineDir, { recursive: true });
            }
            const fileName = path.basename(filePath);
            const quarantinePath = path.join(quarantineDir, `${Date.now()}_${fileName}`);
            fs.renameSync(filePath, quarantinePath);
            this.logger.warn(`File quarantined: ${fileName} - Reason: ${reason} - Path: ${quarantinePath}`);
        }
        catch (error) {
            this.logger.error(`Failed to quarantine file ${filePath}:`, error);
            throw error;
        }
    }
};
exports.ContentScannerService = ContentScannerService;
exports.ContentScannerService = ContentScannerService = ContentScannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ContentScannerService);
//# sourceMappingURL=content-scanner.service.js.map