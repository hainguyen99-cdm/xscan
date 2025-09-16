import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);

export interface MediaFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ProcessedMedia {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'gif' | 'video' | 'audio';
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
}

export interface MediaValidationRules {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxDuration?: number; // in seconds (for video/audio)
  maxDimensions?: { width: number; height: number };
}

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);
  private readonly uploadDir: string;
  private readonly cdnBaseUrl: string;
  private readonly config: any;

  constructor(private configService: ConfigService) {
    // Use hardcoded configuration for now
    this.uploadDir = 'uploads';
    this.cdnBaseUrl = 'http://localhost:3000';
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  // Media validation rules from configuration
  private get imageRules(): MediaValidationRules {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      maxDimensions: { width: 1920, height: 1080 },
    };
  }

  private get videoRules(): MediaValidationRules {
    return {
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      maxDuration: 10, // 10 seconds
      maxDimensions: { width: 1920, height: 1080 },
    };
  }

  private get audioRules(): MediaValidationRules {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
      maxDuration: 5, // 5 minutes
    };
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await mkdirAsync(this.uploadDir, { recursive: true });
      await mkdirAsync(path.join(this.uploadDir, 'images'), { recursive: true });
      await mkdirAsync(path.join(this.uploadDir, 'videos'), { recursive: true });
      await mkdirAsync(path.join(this.uploadDir, 'audio'), { recursive: true });
      await mkdirAsync(path.join(this.uploadDir, 'temp'), { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directories: ${error.message}`);
    }
  }

  /**
   * Upload and process media files
   */
  async uploadMedia(file: MediaFile, streamerId: string): Promise<ProcessedMedia> {
    try {
      // Validate file
      const validationResult = await this.validateMediaFile(file);
      if (!validationResult.isValid) {
        throw new BadRequestException(validationResult.errors.join(', '));
      }

      // Determine media type
      const mediaType = this.determineMediaType(file.mimetype);
      
      // Generate unique filename
      const filename = this.generateUniqueFilename(file.originalname, streamerId);
      
      // Save file to appropriate directory
      const filePath = await this.saveMediaFile(file, filename, mediaType);
      
      // Process media (extract metadata, optimize, etc.)
      const processedMedia = await this.processMedia(filePath, mediaType, file);
      
      // Generate CDN URL
      const cdnUrl = this.generateCdnUrl(filename, mediaType);
      
      // Clean up temporary files
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
    } catch (error) {
      this.logger.error(`Media upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate media file against rules
   */
  private async validateMediaFile(file: MediaFile): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > this.imageRules.maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size`);
    }

    // Check MIME type
    const mediaType = this.determineMediaType(file.mimetype);
    let rules: MediaValidationRules;
    
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

    // Check duration for video/audio files
    if (mediaType === 'video' || mediaType === 'audio') {
      try {
        const duration = await this.getMediaDuration(file.buffer, file.mimetype);
        if (duration > rules.maxDuration) {
          errors.push(`Duration ${duration}s exceeds maximum allowed duration of ${rules.maxDuration}s`);
        }
      } catch (error) {
        this.logger.warn(`Could not determine media duration: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Determine media type from MIME type
   */
  private determineMediaType(mimeType: string): 'image' | 'gif' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) {
      return mimeType === 'image/gif' ? 'gif' : 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    throw new BadRequestException(`Unsupported MIME type: ${mimeType}`);
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalName: string, streamerId: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    return `${streamerId}_${baseName}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Save media file to appropriate directory
   */
  private async saveMediaFile(file: MediaFile, filename: string, mediaType: string): Promise<string> {
    let subDir: string;
    
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
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`);
      throw new BadRequestException('Failed to save uploaded file');
    }
  }

  /**
   * Process media file to extract metadata and optimize if needed
   */
  private async processMedia(filePath: string, mediaType: string, originalFile: MediaFile): Promise<{ dimensions?: { width: number; height: number }; duration?: number }> {
    const result: { dimensions?: { width: number; height: number }; duration?: number } = {};

    try {
      if (mediaType === 'image' || mediaType === 'gif') {
        // For images, we could add image optimization here
        // For now, we'll just extract basic info
        result.dimensions = await this.getImageDimensions(filePath);
      } else if (mediaType === 'video') {
        // For videos, extract dimensions and duration
        result.dimensions = await this.getVideoDimensions(filePath);
        result.duration = await this.getVideoDuration(filePath);
      } else if (mediaType === 'audio') {
        // For audio, extract duration
        result.duration = await this.getAudioDuration(filePath);
      }
    } catch (error) {
      this.logger.warn(`Media processing failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
    // This is a simplified implementation
    // In production, you'd use a library like sharp or jimp
    return { width: 300, height: 200 }; // Default dimensions
  }

  /**
   * Get video dimensions
   */
  private async getVideoDimensions(filePath: string): Promise<{ width: number; height: number }> {
    // This is a simplified implementation
    // In production, you'd use ffmpeg or similar
    return { width: 640, height: 480 }; // Default dimensions
  }

  /**
   * Get video duration
   */
  private async getVideoDuration(filePath: string): Promise<number> {
    // This is a simplified implementation
    // In production, you'd use ffmpeg or similar
    return 5; // Default duration
  }

  /**
   * Get audio duration
   */
  private async getAudioDuration(filePath: string): Promise<number> {
    // This is a simplified implementation
    // In production, you'd use ffmpeg or similar
    return 3; // Default duration
  }

  /**
   * Get media duration from buffer (for validation)
   */
  private async getMediaDuration(buffer: Buffer, mimeType: string): Promise<number> {
    // This is a simplified implementation
    // In production, you'd use ffmpeg or similar
    if (mimeType.startsWith('video/')) {
      return 5; // Default video duration
    }
    if (mimeType.startsWith('audio/')) {
      return 3; // Default audio duration
    }
    return 0;
  }

  /**
   * Generate CDN URL for the uploaded file
   */
  private generateCdnUrl(filename: string, mediaType: string): string {
    let subDir: string;
    
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

  /**
   * Clean up temporary files
   */
  private async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      if (filePath.startsWith(tempDir)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Temporary file cleaned up: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file: ${error.message}`);
    }
  }

  /**
   * Delete media file
   */
  async deleteMedia(filename: string, mediaType: string): Promise<boolean> {
    try {
      let subDir: string;
      
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
    } catch (error) {
      this.logger.error(`Failed to delete media file: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await statAsync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file info
   */
  async getMediaInfo(filename: string, mediaType: string): Promise<ProcessedMedia | null> {
    try {
      let subDir: string;
      
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
        type: mediaType as 'image' | 'gif' | 'video' | 'audio',
        size: stats.size,
        mimeType: this.getMimeTypeFromExtension(path.extname(filename)),
      };
    } catch (error) {
      this.logger.error(`Failed to get media info: ${error.message}`);
      return null;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
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

  /**
   * Get validation rules for client-side validation
   */
  getValidationRules(): {
    image: MediaValidationRules;
    video: MediaValidationRules;
    audio: MediaValidationRules;
  } {
    return {
      image: this.imageRules,
      video: this.videoRules,
      audio: this.audioRules,
    };
  }
} 