import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MediaUploadService, MediaFile } from './media-upload.service';
import { BadRequestException } from '@nestjs/common';

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    unlink: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
  stat: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
}));

// Mock the util.promisify function
jest.mock('util', () => ({
  promisify: jest.fn((fn) => {
    if (fn === require('fs').stat) {
      return require('fs').stat;
    }
    if (fn === require('fs').writeFile) {
      return require('fs').writeFile;
    }
    if (fn === require('fs').mkdir) {
      return require('fs').mkdir;
    }
    return fn;
  }),
}));

describe('MediaUploadService', () => {
  let service: MediaUploadService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MediaUploadService>(MediaUploadService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Set up default mock configuration
    mockConfigService.get.mockReturnValue({
      uploadDir: 'uploads',
      cdnBaseUrl: 'http://localhost:3000',
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxVideoSize: 50 * 1024 * 1024, // 50MB
      maxAudioSize: 10 * 1024 * 1024, // 10MB
      maxVideoDuration: 10,
      maxAudioDuration: 5,
      maxImageDimensions: { width: 1920, height: 1080 },
      maxVideoDimensions: { width: 1920, height: 1080 },
      allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      allowedAudioTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('determineMediaType', () => {
    it('should determine image type correctly', () => {
      const result = (service as any).determineMediaType('image/jpeg');
      expect(result).toBe('image');
    });

    it('should determine gif type correctly', () => {
      const result = (service as any).determineMediaType('image/gif');
      expect(result).toBe('gif');
    });

    it('should determine video type correctly', () => {
      const result = (service as any).determineMediaType('video/mp4');
      expect(result).toBe('video');
    });

    it('should determine audio type correctly', () => {
      const result = (service as any).determineMediaType('audio/mpeg');
      expect(result).toBe('audio');
    });

    it('should throw error for unsupported MIME type', () => {
      expect(() => {
        (service as any).determineMediaType('application/pdf');
      }).toThrow(BadRequestException);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename with correct format', () => {
      const streamerId = '507f1f77bcf86cd799439011';
      const originalName = 'test-image.jpg';
      
      const result = (service as any).generateUniqueFilename(originalName, streamerId);
      
      expect(result).toMatch(new RegExp(`^${streamerId}_test-image_\\d+_[a-f0-9]{16}\\.jpg$`));
    });

    it('should handle files without extension', () => {
      const streamerId = '507f1f77bcf86cd799439011';
      const originalName = 'test-image';
      
      const result = (service as any).generateUniqueFilename(originalName, streamerId);
      
      expect(result).toMatch(new RegExp(`^${streamerId}_test-image_\\d+_[a-f0-9]{16}$`));
    });
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return correct MIME type for jpg', () => {
      const result = (service as any).getMimeTypeFromExtension('.jpg');
      expect(result).toBe('image/jpeg');
    });

    it('should return correct MIME type for png', () => {
      const result = (service as any).getMimeTypeFromExtension('.png');
      expect(result).toBe('image/png');
    });

    it('should return correct MIME type for mp4', () => {
      const result = (service as any).getMimeTypeFromExtension('.mp4');
      expect(result).toBe('video/mp4');
    });

    it('should return correct MIME type for mp3', () => {
      const result = (service as any).getMimeTypeFromExtension('.mp3');
      expect(result).toBe('audio/mpeg');
    });

    it('should return default MIME type for unknown extension', () => {
      const result = (service as any).getMimeTypeFromExtension('.xyz');
      expect(result).toBe('application/octet-stream');
    });

    it('should handle case insensitive extensions', () => {
      const result = (service as any).getMimeTypeFromExtension('.JPG');
      expect(result).toBe('image/jpeg');
    });
  });

  describe('validation rules', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue({
        uploadDir: 'uploads',
        cdnBaseUrl: 'http://localhost:3000',
        maxImageSize: 5 * 1024 * 1024, // 5MB
        maxVideoSize: 25 * 1024 * 1024, // 25MB
        maxAudioSize: 5 * 1024 * 1024, // 5MB
        maxVideoDuration: 8, // 8 seconds
        maxAudioDuration: 4, // 4 seconds
        maxImageDimensions: { width: 1280, height: 720 },
        maxVideoDimensions: { width: 1280, height: 720 },
        allowedImageTypes: ['image/jpeg', 'image/png'],
        allowedVideoTypes: ['video/mp4'],
        allowedAudioTypes: ['audio/mpeg'],
      });
      
      // Recreate the service with new configuration
      service = new MediaUploadService(mockConfigService as any);
    });

    it('should return correct image validation rules', () => {
      const rules = (service as any).imageRules;
      expect(rules.maxSize).toBe(5 * 1024 * 1024);
      expect(rules.allowedTypes).toEqual(['image/jpeg', 'image/png']);
      expect(rules.maxDimensions).toEqual({ width: 1280, height: 720 });
    });

    it('should return correct video validation rules', () => {
      const rules = (service as any).videoRules;
      expect(rules.maxSize).toBe(25 * 1024 * 1024);
      expect(rules.allowedTypes).toEqual(['video/mp4']);
      expect(rules.maxDuration).toBe(8);
      expect(rules.maxDimensions).toEqual({ width: 1280, height: 720 });
    });

    it('should return correct audio validation rules', () => {
      const rules = (service as any).audioRules;
      expect(rules.maxSize).toBe(5 * 1024 * 1024);
      expect(rules.allowedTypes).toEqual(['audio/mpeg']);
      expect(rules.maxDuration).toBe(4);
    });
  });

  describe('getValidationRules', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue({
        maxImageSize: 5 * 1024 * 1024,
        maxVideoSize: 25 * 1024 * 1024,
        maxAudioSize: 5 * 1024 * 1024,
        maxVideoDuration: 8,
        maxAudioDuration: 4,
        maxImageDimensions: { width: 1280, height: 720 },
        maxVideoDimensions: { width: 1280, height: 720 },
        allowedImageTypes: ['image/jpeg', 'image/png'],
        allowedVideoTypes: ['video/mp4'],
        allowedAudioTypes: ['audio/mpeg'],
      });
    });

    it('should return all validation rules', () => {
      const rules = service.getValidationRules();
      
      expect(rules).toHaveProperty('image');
      expect(rules).toHaveProperty('video');
      expect(rules).toHaveProperty('audio');
      
      expect(rules.image.maxSize).toBe(5 * 1024 * 1024);
      expect(rules.video.maxSize).toBe(25 * 1024 * 1024);
      expect(rules.audio.maxSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      // Mock the fs.stat function that statAsync uses
      const fs = require('fs');
      fs.stat.mockResolvedValue({});
      
      const result = await (service as any).fileExists('/path/to/existing/file');
      expect(result).toBe(true);
      
      // Clean up mock
      fs.stat.mockClear();
    });

    it('should return false for non-existing file', async () => {
      // Mock the fs.stat function that statAsync uses
      const fs = require('fs');
      fs.stat.mockRejectedValue(new Error('File not found'));
      
      const result = await (service as any).fileExists('/path/to/non-existing/file');
      expect(result).toBe(false);
      
      // Clean up mock
      fs.stat.mockClear();
    });
  });

  describe('generateCdnUrl', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue({
        uploadDir: 'uploads',
        cdnBaseUrl: 'https://cdn.example.com',
        maxImageSize: 10 * 1024 * 1024,
        maxVideoSize: 50 * 1024 * 1024,
        maxAudioSize: 10 * 1024 * 1024,
        maxVideoDuration: 10,
        maxAudioDuration: 5,
        maxImageDimensions: { width: 1920, height: 1080 },
        maxVideoDimensions: { width: 1920, height: 1080 },
        allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        allowedAudioTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
      });
      
      // Recreate the service with new configuration
      service = new MediaUploadService(mockConfigService as any);
    });

    it('should generate correct CDN URL for image', () => {
      const result = (service as any).generateCdnUrl('test.jpg', 'image');
      expect(result).toBe('https://cdn.example.com/media/images/test.jpg');
    });

    it('should generate correct CDN URL for video', () => {
      const result = (service as any).generateCdnUrl('test.mp4', 'video');
      expect(result).toBe('https://cdn.example.com/media/videos/test.mp4');
    });

    it('should generate correct CDN URL for audio', () => {
      const result = (service as any).generateCdnUrl('test.mp3', 'audio');
      expect(result).toBe('https://cdn.example.com/media/audio/test.mp3');
    });

    it('should generate correct CDN URL for gif', () => {
      const result = (service as any).generateCdnUrl('test.gif', 'gif');
      expect(result).toBe('https://cdn.example.com/media/images/test.gif');
    });
  });

  describe('cleanupTempFiles', () => {
    it('should cleanup temp files', async () => {
      const fs = require('fs');
      const path = require('path');
      fs.promises.unlink.mockResolvedValue(undefined);
      
      // Use a path that starts with the full temp directory path using correct path separator
      const testPath = path.join('uploads', 'temp', 'test.jpg');
      
      await (service as any).cleanupTempFiles(testPath);
      
      expect(fs.promises.unlink).toHaveBeenCalledWith(testPath);
      
      // Clean up mock
      fs.promises.unlink.mockClear();
    });

    it('should not cleanup non-temp files', async () => {
      const fs = require('fs');
      fs.promises.unlink.mockResolvedValue(undefined);
      
      // Use a path that doesn't start with the temp directory
      await (service as any).cleanupTempFiles('images/test.jpg');
      
      expect(fs.promises.unlink).not.toHaveBeenCalled();
      
      // Clean up mock
      fs.promises.unlink.mockClear();
    });
  });

  describe('processMedia', () => {
    it('should process image files', async () => {
      const mockGetImageDimensions = jest.spyOn(service as any, 'getImageDimensions')
        .mockResolvedValue({ width: 800, height: 600 });
      
      const result = await (service as any).processMedia('/path/to/image.jpg', 'image', {});
      
      expect(mockGetImageDimensions).toHaveBeenCalledWith('/path/to/image.jpg');
      expect(result.dimensions).toEqual({ width: 800, height: 600 });
      
      // Clean up mock
      mockGetImageDimensions.mockRestore();
    });

    it('should process video files', async () => {
      const mockGetVideoDimensions = jest.spyOn(service as any, 'getVideoDimensions')
        .mockResolvedValue({ width: 1280, height: 720 });
      const mockGetVideoDuration = jest.spyOn(service as any, 'getVideoDuration')
        .mockResolvedValue(10);
      
      const result = await (service as any).processMedia('/path/to/video.mp4', 'video', {});
      
      expect(mockGetVideoDimensions).toHaveBeenCalledWith('/path/to/video.mp4');
      expect(mockGetVideoDuration).toHaveBeenCalledWith('/path/to/video.mp4');
      expect(result.dimensions).toEqual({ width: 1280, height: 720 });
      expect(result.duration).toBe(10);
      
      // Clean up mocks
      mockGetVideoDimensions.mockRestore();
      mockGetVideoDuration.mockRestore();
    });

    it('should process audio files', async () => {
      const mockGetAudioDuration = jest.spyOn(service as any, 'getAudioDuration')
        .mockResolvedValue(5);
      
      const result = await (service as any).processMedia('/path/to/audio.mp3', 'audio', {});
      
      expect(mockGetAudioDuration).toHaveBeenCalledWith('/path/to/audio.mp3');
      expect(result.duration).toBe(5);
      
      // Clean up mock
      mockGetAudioDuration.mockRestore();
    });
  });

  describe('getMediaDuration', () => {
    it('should return default duration for video', async () => {
      const result = await (service as any).getMediaDuration(Buffer.from('test'), 'video/mp4');
      expect(result).toBe(5);
    });

    it('should return default duration for audio', async () => {
      const result = await (service as any).getMediaDuration(Buffer.from('test'), 'audio/mpeg');
      expect(result).toBe(3);
    });

    it('should return 0 for other types', async () => {
      const result = await (service as any).getMediaDuration(Buffer.from('test'), 'image/jpeg');
      expect(result).toBe(0);
    });
  });
}); 