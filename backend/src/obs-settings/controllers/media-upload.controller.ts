import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AwsS3Service } from '../../common/services/aws-s3.service';
import { MediaProcessingService } from '../../common/services/media-processing.service';
import { memoryStorage } from 'multer';

@Controller('obs-settings/media')
export class MediaUploadController {
  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly mediaProcessingService: MediaProcessingService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { mediaType: string },
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!req.user?.id) {
      throw new BadRequestException('User ID not found');
    }

    try {
      // Convert file to base64 for processing
      const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const mediaFile = {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        data: base64Data,
      };

      // Process and upload to S3
      const processedMedia = await this.mediaProcessingService.processSingleFile(
        mediaFile,
        req.user.id
      );

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
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit per file
    },
  }))
  async uploadMultipleMedia(
    @UploadedFile() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (!req.user?.id) {
      throw new BadRequestException('User ID not found');
    }

    try {
      const mediaFiles = files.map(file => ({
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        data: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      }));

      // Process and upload to S3
      const processedMedia = await this.mediaProcessingService.processMediaFiles(
        mediaFiles,
        req.user.id
      );

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
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }
}