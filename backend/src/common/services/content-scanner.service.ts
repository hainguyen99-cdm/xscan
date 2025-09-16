import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ScanResult {
  isSafe: boolean;
  threats: string[];
  fileType: string;
  fileSize: number;
  hash: string;
  scanTimestamp: Date;
}

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ContentScannerService {
  private readonly logger = new Logger(ContentScannerService.name);
  private readonly allowedMimeTypes = [
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

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];

  constructor(private readonly configService: ConfigService) {}

  async scanFile(filePath: string, originalName: string): Promise<ScanResult> {
    try {
      this.logger.log(`Scanning file: ${originalName} at ${filePath}`);

      // Basic file validation
      const validation = this.validateFile(filePath, originalName);
      if (!validation.isValid) {
        throw new HttpException(
          `File validation failed: ${validation.errors.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Get file information
      const stats = fs.statSync(filePath);
      const fileType = this.detectMimeType(filePath, originalName);
      const fileHash = await this.calculateFileHash(filePath);

      // Check file size
      if (stats.size > this.maxFileSize) {
        throw new HttpException(
          `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
          HttpStatus.PAYLOAD_TOO_LARGE
        );
      }

      // Check for dangerous file extensions
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

      // Check file header/magic bytes
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

      // Content analysis for images
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

      // Content analysis for videos
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

      // If all checks pass, file is considered safe
      return {
        isSafe: true,
        threats: [],
        fileType,
        fileSize: stats.size,
        hash: fileHash,
        scanTimestamp: new Date()
      };

    } catch (error) {
      this.logger.error(`Error scanning file ${originalName}:`, error);
      throw error;
    }
  }

  private validateFile(filePath: string, originalName: string): FileValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push('File does not exist');
    }

    // Check file name
    if (!originalName || originalName.trim().length === 0) {
      errors.push('Invalid file name');
    }

    // Check for null bytes in filename (potential path traversal)
    if (originalName.includes('\0')) {
      errors.push('Filename contains null bytes');
    }

    // Check for path traversal attempts
    if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
      errors.push('Filename contains path traversal characters');
    }

    // Check file extension
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

  private detectMimeType(filePath: string, originalName: string): string {
    const extension = path.extname(originalName).toLowerCase();
    
    // Simple MIME type detection based on extension
    const mimeTypes: { [key: string]: string } = {
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

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async validateFileHeader(filePath: string): Promise<FileValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // Check for common file signatures
      const hex = buffer.toString('hex').toUpperCase();
      
      // JPEG
      if (hex.startsWith('FFD8FF')) {
        // Valid JPEG
      }
      // PNG
      else if (hex.startsWith('89504E47')) {
        // Valid PNG
      }
      // GIF
      else if (hex.startsWith('47494638')) {
        // Valid GIF
      }
      // MP4
      else if (hex.startsWith('00000020') || hex.startsWith('00000018')) {
        // Valid MP4
      }
      // WebM
      else if (hex.startsWith('1A45DFA3')) {
        // Valid WebM
      }
      // MP3
      else if (hex.startsWith('FFFB') || hex.startsWith('FFFA') || hex.startsWith('FFFE')) {
        // Valid MP3
      }
      else {
        warnings.push('File header does not match expected signature for declared type');
      }

    } catch (error) {
      errors.push('Unable to read file header');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async analyzeImageContent(filePath: string): Promise<{ isSafe: boolean; threats: string[] }> {
    const threats: string[] = [];

    try {
      // Check for potential steganography or hidden data
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      // Check if file size is suspiciously large for its type
      // This is a basic check - in production you'd want more sophisticated analysis
      if (fileSize > 5 * 1024 * 1024) { // 5MB
        threats.push('File size is unusually large for an image');
      }

      // Check for potential embedded scripts in SVG files
      if (filePath.endsWith('.svg')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('<script') || content.includes('javascript:')) {
          threats.push('SVG contains potentially malicious scripts');
        }
      }

    } catch (error) {
      threats.push('Unable to analyze image content');
    }

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  private async analyzeVideoContent(filePath: string): Promise<{ isSafe: boolean; threats: string[] }> {
    const threats: string[] = [];

    try {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      // Check for suspiciously large video files
      if (fileSize > 100 * 1024 * 1024) { // 100MB
        threats.push('Video file size exceeds reasonable limits');
      }

      // Additional video-specific checks could be added here
      // Such as checking for embedded metadata, checking video duration, etc.

    } catch (error) {
      threats.push('Unable to analyze video content');
    }

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  async quarantineFile(filePath: string, reason: string): Promise<void> {
    try {
      const quarantineDir = path.join(process.cwd(), 'uploads', 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }

      const fileName = path.basename(filePath);
      const quarantinePath = path.join(quarantineDir, `${Date.now()}_${fileName}`);
      
      fs.renameSync(filePath, quarantinePath);
      
      // Log quarantine action
      this.logger.warn(`File quarantined: ${fileName} - Reason: ${reason} - Path: ${quarantinePath}`);
      
    } catch (error) {
      this.logger.error(`Failed to quarantine file ${filePath}:`, error);
      throw error;
    }
  }
} 