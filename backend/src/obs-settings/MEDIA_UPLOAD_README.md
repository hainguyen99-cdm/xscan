# Media Upload System for OBS Alert Configuration

This document describes the media upload functionality implemented for step 2 of task 6, which handles image/GIF/video and sound file uploads for the OBS Alert Configuration System.

## Overview

The media upload system provides a comprehensive solution for:
- Uploading and validating media files (images, GIFs, videos, audio)
- Processing and storing media files with proper organization
- CDN integration for serving media files
- Integration with OBS settings for seamless configuration

## Architecture

### Components

1. **MediaUploadService** (`src/common/services/media-upload.service.ts`)
   - Core service handling file uploads, validation, and processing
   - Manages file storage and CDN URL generation
   - Provides validation rules and file management

2. **MediaController** (`src/obs-settings/media.controller.ts`)
   - REST API endpoints for media operations
   - Handles file uploads, deletions, and information retrieval
   - Provides media serving capabilities

3. **OBS Settings Integration** (`src/obs-settings/obs-settings.controller.ts`)
   - Media upload endpoints integrated with OBS settings
   - Automatic OBS settings updates when media is uploaded
   - Streamlined workflow for streamers

4. **Configuration** (`src/config/media-upload.config.ts`)
   - Centralized configuration management
   - Environment variable support
   - Extensible storage and processing options

## Features

### File Types Supported

- **Images**: JPEG, JPG, PNG, WebP, GIF
- **Videos**: MP4, WebM, OGG (≤ 10 seconds)
- **Audio**: MP3, WAV, OGG (≤ 5 seconds)

### Validation Rules

- **File Size Limits**:
  - Images: 10MB max
  - Videos: 50MB max
  - Audio: 10MB max

- **Duration Limits**:
  - Videos: 10 seconds max
  - Audio: 5 seconds max

- **Dimension Limits**:
  - Images/Videos: 1920x1080 max

- **Security**:
  - MIME type validation
  - File extension validation
  - Content validation (configurable)

### Storage Organization

```
uploads/
├── images/          # Image and GIF files
├── videos/          # Video files
├── audio/           # Audio files
└── temp/            # Temporary files (auto-cleaned)
```

### CDN Integration

- Automatic CDN URL generation
- Configurable CDN base URL
- Proper MIME type headers
- Caching headers for performance

## API Endpoints

### Media Upload

#### Upload Media for Current User
```http
POST /obs-settings/my-settings/upload-media
Content-Type: multipart/form-data

file: [binary file]
mediaType: image|gif|video|audio
settingsType: image|sound
```

#### Upload Media for Specific Streamer (Admin)
```http
POST /obs-settings/{streamerId}/upload-media
Content-Type: multipart/form-data

file: [binary file]
mediaType: image|gif|video|audio
settingsType: image|sound
```

### Media Management

#### Get Media Information
```http
GET /media/info/{filename}?mediaType={type}
```

#### Delete Media
```http
DELETE /media/delete
Content-Type: application/json

{
  "filename": "filename.ext",
  "mediaType": "image|gif|video|audio"
}
```

#### Get Validation Rules
```http
GET /media/validation-rules
```

#### Serve Media Files
```http
GET /media/serve/{mediaType}/{filename}
```

### OBS Settings Integration

#### Remove Media from Settings
```http
DELETE /obs-settings/my-settings/remove-media
Content-Type: application/json

{
  "settingsType": "image|sound"
}
```

## Configuration

### Environment Variables

```bash
# Upload Configuration
UPLOAD_DIR=uploads
CDN_BASE_URL=https://cdn.example.com

# File Size Limits
MAX_IMAGE_SIZE=10485760      # 10MB in bytes
MAX_VIDEO_SIZE=52428800      # 50MB in bytes
MAX_AUDIO_SIZE=10485760      # 10MB in bytes

# Duration Limits
MAX_VIDEO_DURATION=10        # 10 seconds
MAX_AUDIO_DURATION=5         # 5 seconds

# Dimension Limits
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
MAX_VIDEO_WIDTH=1920
MAX_VIDEO_HEIGHT=1080

# Processing Options
ENABLE_IMAGE_OPTIMIZATION=true
ENABLE_VIDEO_COMPRESSION=true
ENABLE_AUDIO_COMPRESSION=true

# Security
ENABLE_VIRUS_SCAN=true
ENABLE_FILE_TYPE_VALIDATION=true
ENABLE_CONTENT_VALIDATION=true
```

### Configuration File

The system uses a centralized configuration file (`src/config/media-upload.config.ts`) that supports:

- Local file storage
- Cloud storage (S3, Google Cloud Storage, Azure)
- Image/video/audio processing options
- Security settings
- Cleanup policies

## Usage Examples

### Frontend Integration

#### Upload Image for OBS Settings

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('mediaType', 'image');
formData.append('settingsType', 'image');

const response = await fetch('/obs-settings/my-settings/upload-media', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Media uploaded:', result.url);
```

#### Upload Audio for OBS Settings

```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('mediaType', 'audio');
formData.append('settingsType', 'sound');

const response = await fetch('/obs-settings/my-settings/upload-media', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Audio uploaded:', result.url);
```

### Backend Integration

#### Using MediaUploadService

```typescript
import { MediaUploadService } from '../common/services/media-upload.service';

@Injectable()
export class MyService {
  constructor(private mediaUploadService: MediaUploadService) {}

  async handleMediaUpload(file: Express.Multer.File, streamerId: string) {
    const mediaFile: MediaFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const result = await this.mediaUploadService.uploadMedia(mediaFile, streamerId);
    return result;
  }
}
```

## Security Considerations

### File Validation

- MIME type verification
- File extension validation
- Content validation (configurable)
- Virus scanning support (configurable)

### Access Control

- JWT authentication required
- Role-based access control
- Streamers can only upload for themselves
- Admins can upload for any streamer

### File Storage

- Secure file naming (UUID-based)
- Organized directory structure
- Temporary file cleanup
- Configurable retention policies

## Performance Optimizations

### File Processing

- Asynchronous file operations
- Stream-based file serving
- Configurable image/video optimization
- CDN integration for scalability

### Storage

- Efficient directory structure
- Automatic cleanup of temporary files
- Configurable file retention policies
- Support for cloud storage providers

## Error Handling

### Common Error Scenarios

- **File too large**: Returns 413 with size limit information
- **Invalid file type**: Returns 400 with allowed types
- **File validation failed**: Returns 400 with specific error details
- **Storage error**: Returns 500 with internal error message

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "File type application/pdf is not allowed",
  "error": "Bad Request"
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run media upload tests specifically
npm run test -- --testPathPattern=media-upload.service.spec.ts

# Run tests with coverage
npm run test:cov
```

### Test Coverage

The test suite covers:
- File type determination
- Filename generation
- MIME type mapping
- Validation rules
- File operations
- Error handling
- Configuration management

## Future Enhancements

### Planned Features

1. **Advanced Media Processing**
   - Image optimization with Sharp
   - Video compression with FFmpeg
   - Audio processing with FFmpeg

2. **Cloud Storage Integration**
   - AWS S3 support
   - Google Cloud Storage
   - Azure Blob Storage

3. **Media Management**
   - Bulk upload support
   - Media library management
   - Version control for media files

4. **Performance Improvements**
   - Streaming uploads
   - Background processing
   - CDN optimization

### Extensibility

The system is designed to be easily extensible:
- Modular service architecture
- Configuration-driven behavior
- Plugin system for storage providers
- Custom validation rules support

## Troubleshooting

### Common Issues

1. **Upload Directory Permissions**
   - Ensure the uploads directory is writable
   - Check file system permissions

2. **File Size Limits**
   - Verify environment variable configuration
   - Check server upload limits (nginx, Apache)

3. **MIME Type Issues**
   - Ensure proper file extensions
   - Check browser file type detection

4. **Storage Errors**
   - Verify disk space availability
   - Check file system integrity

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## Support

For issues or questions:
1. Check the test suite for usage examples
2. Review the configuration options
3. Check the error logs for specific error messages
4. Verify environment variable configuration

## Contributing

When contributing to the media upload system:
1. Follow the existing code patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow security best practices 