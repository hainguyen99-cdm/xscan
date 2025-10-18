import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dayjs from 'dayjs';

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
  region: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client;
  private readonly config: S3Config;

  constructor(private configService: ConfigService) {
    this.config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'ap-southeast-1',
      bucket: process.env.S3_BUCKET_NAME || 'xscan-media',
    };

    // Validate required credentials
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    }

    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });

    this.logger.log(`AWS S3 Service initialized with bucket: ${this.config.bucket}, region: ${this.config.region}`);
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer | Uint8Array | string,
    fileName: string,
    contentType: string,
    userId: string,
    options?: {
      generatePresignedUrl?: boolean;
      expiresIn?: number; // in seconds, default 1 hour
    }
  ): Promise<S3UploadResult> {
    try {
      // Generate S3 key according to the specified pattern
      const key = this.generateS3Key(userId, fileName);
      
      // Convert base64 string to buffer if needed
      let fileBuffer: Buffer;
      if (typeof file === 'string') {
        // Remove data URL prefix if present
        const base64Data = file.replace(/^data:[^;]+;base64,/, '');
        fileBuffer = Buffer.from(base64Data, 'base64');
      } else if (file instanceof Uint8Array) {
        fileBuffer = Buffer.from(file);
      } else {
        fileBuffer = file;
      }

      const command = new PutObjectCommand({
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
        // Add CORS headers for audio files
        ...(contentType.startsWith('audio/') && {
          CacheControl: 'public, max-age=31536000',
          ContentDisposition: 'inline',
        }),
      });

      await this.s3Client.send(command);

      // Generate the public URL using CDN
      const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
      const url = `${cdnBaseUrl}/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      const result: S3UploadResult = {
        key,
        url,
        bucket: this.config.bucket,
        region: this.config.region,
      };

      // Generate presigned URL if requested
      if (options?.generatePresignedUrl) {
        const presignedUrl = await this.getPresignedUrl(key, options.expiresIn || 3600);
        result.url = presignedUrl;
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`, error.stack);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`, error.stack);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  /**
   * Get a presigned URL for a file
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw new Error(`Presigned URL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate S3 key according to the specified pattern
   * Pattern: uploads/${userId}/${dayjs().format('YYYY/MM')}/${Date.now()}_${fileName}
   */
  private generateS3Key(userId: string, fileName: string): string {
    const now = dayjs();
    const timestamp = Date.now();
    return `uploads/${userId}/${now.format('YYYY/MM')}/${timestamp}_${fileName}`;
  }

  /**
   * Extract key from S3 URL or CDN URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
      const cdnHostname = new URL(cdnBaseUrl).hostname;
      
      if (urlObj.hostname.includes(this.config.bucket) || urlObj.hostname === cdnHostname) {
        return urlObj.pathname.substring(1); // Remove leading slash
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to extract key from URL: ${url}`);
      return null;
    }
  }

  /**
   * Check if a URL is an S3 URL or CDN URL
   */
  isS3Url(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
      const cdnHostname = new URL(cdnBaseUrl).hostname;
      
      return (
        (urlObj.hostname.includes(this.config.bucket) && urlObj.hostname.includes('s3')) ||
        urlObj.hostname === cdnHostname
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get S3 configuration
   */
  getConfig(): S3Config {
    return { ...this.config };
  }

  /**
   * Get CDN base URL
   */
  getCdnBaseUrl(): string {
    return process.env.CDN_BASE_URL || 'https://cdn.xscan.top';
  }

  /**
   * Convert S3 URL to CDN URL
   */
  convertToCdnUrl(s3Url: string): string {
    try {
      const urlObj = new URL(s3Url);
      if (urlObj.hostname.includes(this.config.bucket) && urlObj.hostname.includes('s3')) {
        const key = urlObj.pathname.substring(1); // Remove leading slash
        return `${this.getCdnBaseUrl()}/${key}`;
      }
      return s3Url; // Return original if not an S3 URL
    } catch (error) {
      this.logger.warn(`Failed to convert S3 URL to CDN URL: ${s3Url}`);
      return s3Url;
    }
  }
}
