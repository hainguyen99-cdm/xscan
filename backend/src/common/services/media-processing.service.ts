import { Injectable, Logger } from '@nestjs/common';
import { AwsS3Service, S3UploadResult } from './aws-s3.service';

export interface MediaFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64 data URL
}

export interface ProcessedMedia {
  name: string;
  type: string;
  size: number;
  url: string; // CDN URL
  s3Key: string;
}

@Injectable()
export class MediaProcessingService {
  private readonly logger = new Logger(MediaProcessingService.name);

  constructor(private readonly s3Service: AwsS3Service) {}

  /**
   * Process media files and upload to S3
   */
  async processMediaFiles(
    mediaFiles: MediaFile[],
    userId: string
  ): Promise<ProcessedMedia[]> {
    const processedFiles: ProcessedMedia[] = [];

    for (const file of mediaFiles) {
      try {
        const processed = await this.processSingleFile(file, userId);
        processedFiles.push(processed);
      } catch (error) {
        this.logger.error(`Failed to process file ${file.name}: ${error.message}`);
        throw error;
      }
    }

    return processedFiles;
  }

  /**
   * Process a single media file
   */
  async processSingleFile(file: MediaFile, userId: string): Promise<ProcessedMedia> {
    try {
      // Extract file extension from name
      const fileExtension = this.getFileExtension(file.name);
      
      // Generate a clean filename
      const cleanFileName = this.generateCleanFileName(file.name, fileExtension);
      
      // Upload to S3
      const s3Result = await this.s3Service.uploadFile(
        file.data,
        cleanFileName,
        file.type,
        userId
      );

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: s3Result.url,
        s3Key: s3Result.key,
      };
    } catch (error) {
      this.logger.error(`Failed to process file ${file.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract media files from donation level configuration
   */
  extractMediaFiles(configuration: any): MediaFile[] {
    const mediaFiles: MediaFile[] = [];

    // Extract from imageSettings
    if (configuration.imageSettings?.url && this.isBase64DataUrl(configuration.imageSettings.url)) {
      mediaFiles.push({
        name: `image_${Date.now()}.${this.getExtensionFromMimeType(configuration.imageSettings.mediaType)}`,
        type: this.getMimeTypeFromDataUrl(configuration.imageSettings.url),
        size: this.getBase64Size(configuration.imageSettings.url),
        data: configuration.imageSettings.url,
      });
    }

    // Extract from soundSettings
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

  /**
   * Replace base64 URLs with CDN URLs in configuration
   */
  replaceMediaUrlsInConfiguration(
    configuration: any,
    processedMedia: ProcessedMedia[]
  ): any {
    const updatedConfig = { ...configuration };

    // Replace image URL
    if (updatedConfig.imageSettings?.url && this.isBase64DataUrl(updatedConfig.imageSettings.url)) {
      const imageMedia = processedMedia.find(m => m.type.startsWith('image/'));
      if (imageMedia) {
        updatedConfig.imageSettings.url = imageMedia.url;
        updatedConfig.imageSettings.s3Key = imageMedia.s3Key;
      }
    }

    // Replace sound URL
    if (updatedConfig.soundSettings?.url && this.isBase64DataUrl(updatedConfig.soundSettings.url)) {
      const soundMedia = processedMedia.find(m => m.type.startsWith('audio/'));
      if (soundMedia) {
        updatedConfig.soundSettings.url = soundMedia.url;
        updatedConfig.soundSettings.s3Key = soundMedia.s3Key;
      }
    }

    return updatedConfig;
  }

  /**
   * Clean up old S3 files when updating donation levels
   */
  async cleanupOldMediaFiles(
    oldConfiguration: any,
    newConfiguration: any
  ): Promise<void> {
    const oldS3Keys: string[] = [];
    const newS3Keys: string[] = [];

    // Extract S3 keys from old configuration
    if (oldConfiguration.imageSettings?.s3Key) {
      oldS3Keys.push(oldConfiguration.imageSettings.s3Key);
    }
    if (oldConfiguration.soundSettings?.s3Key) {
      oldS3Keys.push(oldConfiguration.soundSettings.s3Key);
    }

    // Extract S3 keys from new configuration
    if (newConfiguration.imageSettings?.s3Key) {
      newS3Keys.push(newConfiguration.imageSettings.s3Key);
    }
    if (newConfiguration.soundSettings?.s3Key) {
      newS3Keys.push(newConfiguration.soundSettings.s3Key);
    }

    // Find keys to delete (in old but not in new)
    const keysToDelete = oldS3Keys.filter(key => !newS3Keys.includes(key));

    // Delete old files
    for (const key of keysToDelete) {
      try {
        await this.s3Service.deleteFile(key);
        this.logger.log(`Cleaned up old media file: ${key}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old media file ${key}: ${error.message}`);
      }
    }
  }

  /**
   * Check if a string is a base64 data URL
   */
  private isBase64DataUrl(str: string): boolean {
    return str && str.startsWith('data:') && str.includes('base64,');
  }

  /**
   * Get MIME type from data URL
   */
  private getMimeTypeFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/^data:([^;]+);base64,/);
    return match ? match[1] : 'application/octet-stream';
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mediaType: string): string {
    const mimeToExt: { [key: string]: string } = {
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

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1) : '';
  }

  /**
   * Generate a clean filename
   */
  private generateCleanFileName(originalName: string, extension: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomSuffix}.${extension}`;
  }

  /**
   * Estimate base64 data size
   */
  private getBase64Size(dataUrl: string): number {
    const base64Data = dataUrl.split(',')[1];
    return Math.round((base64Data.length * 3) / 4);
  }
}
