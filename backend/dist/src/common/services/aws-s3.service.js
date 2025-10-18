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
var AwsS3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Service = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dayjs = require("dayjs");
let AwsS3Service = AwsS3Service_1 = class AwsS3Service {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AwsS3Service_1.name);
        this.config = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'ap-southeast-1',
            bucket: process.env.S3_BUCKET_NAME || 'xscan-media',
        };
        if (!this.config.accessKeyId || !this.config.secretAccessKey) {
            throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
        });
        this.logger.log(`AWS S3 Service initialized with bucket: ${this.config.bucket}, region: ${this.config.region}`);
    }
    async uploadFile(file, fileName, contentType, userId, options) {
        try {
            const key = this.generateS3Key(userId, fileName);
            let fileBuffer;
            if (typeof file === 'string') {
                const base64Data = file.replace(/^data:[^;]+;base64,/, '');
                fileBuffer = Buffer.from(base64Data, 'base64');
            }
            else if (file instanceof Uint8Array) {
                fileBuffer = Buffer.from(file);
            }
            else {
                fileBuffer = file;
            }
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                Metadata: {
                    userId,
                    originalName: fileName,
                    uploadedAt: new Date().toISOString(),
                },
                ACL: undefined,
            });
            await this.s3Client.send(command);
            const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
            const url = `${cdnBaseUrl}/${key}`;
            this.logger.log(`File uploaded successfully: ${key}`);
            const result = {
                key,
                url,
                bucket: this.config.bucket,
                region: this.config.region,
            };
            if (options?.generatePresignedUrl) {
                const presignedUrl = await this.getPresignedUrl(key, options.expiresIn || 3600);
                result.url = presignedUrl;
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to upload file to S3: ${error.message}`, error.stack);
            throw new Error(`S3 upload failed: ${error.message}`);
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file from S3: ${error.message}`, error.stack);
            throw new Error(`S3 delete failed: ${error.message}`);
        }
    }
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
            });
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return presignedUrl;
        }
        catch (error) {
            this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
            throw new Error(`Presigned URL generation failed: ${error.message}`);
        }
    }
    generateS3Key(userId, fileName) {
        const now = dayjs();
        const timestamp = Date.now();
        return `uploads/${userId}/${now.format('YYYY/MM')}/${timestamp}_${fileName}`;
    }
    extractKeyFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
            const cdnHostname = new URL(cdnBaseUrl).hostname;
            if (urlObj.hostname.includes(this.config.bucket) || urlObj.hostname === cdnHostname) {
                return urlObj.pathname.substring(1);
            }
            return null;
        }
        catch (error) {
            this.logger.warn(`Failed to extract key from URL: ${url}`);
            return null;
        }
    }
    isS3Url(url) {
        try {
            const urlObj = new URL(url);
            const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
            const cdnHostname = new URL(cdnBaseUrl).hostname;
            return ((urlObj.hostname.includes(this.config.bucket) && urlObj.hostname.includes('s3')) ||
                urlObj.hostname === cdnHostname);
        }
        catch (error) {
            return false;
        }
    }
    getConfig() {
        return { ...this.config };
    }
    getCdnBaseUrl() {
        return process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
    }
    convertToCdnUrl(s3Url) {
        try {
            const urlObj = new URL(s3Url);
            if (urlObj.hostname.includes(this.config.bucket) && urlObj.hostname.includes('s3')) {
                const key = urlObj.pathname.substring(1);
                return `${this.getCdnBaseUrl()}/${key}`;
            }
            return s3Url;
        }
        catch (error) {
            this.logger.warn(`Failed to convert S3 URL to CDN URL: ${s3Url}`);
            return s3Url;
        }
    }
};
exports.AwsS3Service = AwsS3Service;
exports.AwsS3Service = AwsS3Service = AwsS3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], AwsS3Service);
//# sourceMappingURL=aws-s3.service.js.map