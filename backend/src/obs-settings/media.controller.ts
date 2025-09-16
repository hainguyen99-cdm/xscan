import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  Res,
  HttpStatus,
  BadRequestException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaUploadService, MediaFile } from '../common/services/media-upload.service';
import {
  MediaUploadResponseDto,
  MediaDeleteRequestDto,
  MediaValidationDto,
  MediaUploadProgressDto,
} from './dto/media-upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('Media Upload')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaUploadService: MediaUploadService) {}

  @Post('upload/:streamerId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @ApiParam({ name: 'streamerId', description: 'ID of the streamer' })
  @ApiResponse({
    status: 201,
    description: 'Media uploaded successfully',
    type: MediaUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large',
  })
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  async uploadMedia(
    @Param('streamerId') streamerId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('mediaType') mediaType: string,
  ): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!mediaType) {
      throw new BadRequestException('Media type is required');
    }

    // Validate media type
    const validMediaTypes = ['image', 'gif', 'video', 'audio'];
    if (!validMediaTypes.includes(mediaType)) {
      throw new BadRequestException(`Invalid media type. Must be one of: ${validMediaTypes.join(', ')}`);
    }

    // Convert Express.Multer.File to MediaFile interface
    const mediaFile: MediaFile = {
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
    } catch (error) {
      this.logger.error(`Media upload failed: ${error.message}`);
      throw error;
    }
  }

  @Delete('delete')
  @ApiBody({ type: MediaDeleteRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Media deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Media file not found',
  })
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  async deleteMedia(@Body() deleteRequest: MediaDeleteRequestDto): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Deleting media: ${deleteRequest.filename} (${deleteRequest.mediaType})`);
      
      const deleted = await this.mediaUploadService.deleteMedia(
        deleteRequest.filename,
        deleteRequest.mediaType,
      );

      if (deleted) {
        this.logger.log(`Media deleted successfully: ${deleteRequest.filename}`);
        return { success: true, message: 'Media deleted successfully' };
      } else {
        this.logger.warn(`Media file not found: ${deleteRequest.filename}`);
        return { success: false, message: 'Media file not found' };
      }
    } catch (error) {
      this.logger.error(`Media deletion failed: ${error.message}`);
      throw error;
    }
  }

  @Get('info/:filename')
  @ApiParam({ name: 'filename', description: 'Name of the media file' })
  @ApiQuery({ name: 'mediaType', enum: ['image', 'gif', 'video', 'audio'], description: 'Type of media' })
  @ApiResponse({
    status: 200,
    description: 'Media information retrieved successfully',
    type: MediaUploadResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Media file not found',
  })
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  async getMediaInfo(
    @Param('filename') filename: string,
    @Query('mediaType') mediaType: string,
  ): Promise<MediaUploadResponseDto | null> {
    if (!mediaType) {
      throw new BadRequestException('Media type is required');
    }

    try {
      this.logger.log(`Getting media info: ${filename} (${mediaType})`);
      
      const mediaInfo = await this.mediaUploadService.getMediaInfo(filename, mediaType);
      
      if (!mediaInfo) {
        this.logger.warn(`Media file not found: ${filename}`);
        return null;
      }

      return mediaInfo;
    } catch (error) {
      this.logger.error(`Failed to get media info: ${error.message}`);
      throw error;
    }
  }

  @Get('validation-rules')
  @ApiResponse({
    status: 200,
    description: 'Media validation rules retrieved successfully',
    type: [MediaValidationDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Roles(UserRole.STREAMER, UserRole.ADMIN)
  async getValidationRules(): Promise<{
    image: MediaValidationDto;
    video: MediaValidationDto;
    audio: MediaValidationDto;
  }> {
    return {
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        maxDimensions: { width: 1920, height: 1080 },
      },
      video: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        maxDuration: 10, // 10 seconds
        maxDimensions: { width: 1920, height: 1080 },
      },
      audio: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
        maxDuration: 5, // 5 seconds
      },
    };
  }

  @Get('serve/:mediaType/:filename')
  @ApiParam({ name: 'mediaType', enum: ['images', 'videos', 'audio'], description: 'Type of media directory' })
  @ApiParam({ name: 'filename', description: 'Name of the media file' })
  @ApiResponse({
    status: 200,
    description: 'Media file served successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Media file not found',
  })
  async serveMedia(
    @Param('mediaType') mediaType: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate media type
      const validMediaTypes = ['images', 'videos', 'audio'];
      if (!validMediaTypes.includes(mediaType)) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid media type' });
        return;
      }

      // Get media info to determine MIME type
      const mediaInfo = await this.mediaUploadService.getMediaInfo(filename, mediaType.slice(0, -1) as 'image' | 'gif' | 'video' | 'audio');
      
      if (!mediaInfo) {
        res.status(HttpStatus.NOT_FOUND).json({ error: 'Media file not found' });
        return;
      }

      // Set appropriate headers
      res.setHeader('Content-Type', mediaInfo.mimeType);
      res.setHeader('Content-Length', mediaInfo.size.toString());
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Stream the file
      const filePath = `uploads/${mediaType}/${filename}`;
      
      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        res.status(HttpStatus.NOT_FOUND).json({ error: 'Media file not found' });
        return;
      }

      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Handle errors
      fileStream.on('error', (error) => {
        this.logger.error(`Error streaming media file: ${error.message}`);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to serve media file' });
        }
      });

    } catch (error) {
      this.logger.error(`Error serving media: ${error.message}`);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
      }
    }
  }

  @Get('health')
  @ApiResponse({
    status: 200,
    description: 'Media service health check',
  })
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'MediaUploadService',
    };
  }
} 