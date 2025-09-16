import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.uploadDir;
    this.maxFileSize = this.configService.maxFileSize;
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    const fullPath = path.join(process.cwd(), this.uploadDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Check if file.buffer exists
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
      throw new BadRequestException('File buffer is missing. Please try uploading the file again.');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}_${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    
    // Use forward slashes for cross-platform compatibility
    const filePath = `${this.uploadDir}/profiles/${fileName}`.replace(/\\/g, '/');

    // Ensure profiles subdirectory exists
    const profilesDir = path.join(process.cwd(), this.uploadDir, 'profiles');
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }

    // Save file
    const fullPath = path.join(process.cwd(), this.uploadDir, 'profiles', fileName);
    console.log('Saving file to:', fullPath, 'Buffer size:', file.buffer.length);
    fs.writeFileSync(fullPath, file.buffer);

    // Return relative path for database storage (with forward slashes)
    return filePath;
  }

  async uploadCoverPhoto(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Check if file.buffer exists
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
      throw new BadRequestException('File buffer is missing. Please try uploading the file again.');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}_cover_${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    
    // Use forward slashes for cross-platform compatibility
    const filePath = `${this.uploadDir}/covers/${fileName}`.replace(/\\/g, '/');

    // Ensure covers subdirectory exists
    const coversDir = path.join(process.cwd(), this.uploadDir, 'covers');
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }

    // Save file
    const fullPath = path.join(process.cwd(), this.uploadDir, 'covers', fileName);
    console.log('Saving cover photo to:', fullPath, 'Buffer size:', file.buffer.length);
    fs.writeFileSync(fullPath, file.buffer);

    // Return relative path for database storage (with forward slashes)
    return filePath;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async deleteProfilePicture(filePath: string): Promise<void> {
    if (!filePath) return;

    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getProfilePictureUrl(filePath: string): string {
    if (!filePath) return null;

    const baseUrl = this.configService.baseUrl;
    // Ensure the URL uses forward slashes and is properly formatted
    const cleanPath = filePath.replace(/\\/g, '/');
    const fullUrl = `${baseUrl}/${cleanPath}`;
    console.log('FileUploadService: generated URL:', fullUrl);
    
    return fullUrl;
  }

  getCoverPhotoUrl(filePath: string): string {
    if (!filePath) return null;

    const baseUrl = this.configService.baseUrl;
    // Ensure the URL uses forward slashes and is properly formatted
    const cleanPath = filePath.replace(/\\/g, '/');
    const fullUrl = `${baseUrl}/${cleanPath}`;
    console.log('FileUploadService: generated cover photo URL:', fullUrl);
    
    return fullUrl;
  }
}
