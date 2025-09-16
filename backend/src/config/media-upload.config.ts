import { registerAs } from '@nestjs/config';

export default registerAs('mediaUpload', () => ({
  // Upload directory configuration
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  
  // CDN configuration
  cdnBaseUrl: process.env.CDN_BASE_URL || 'http://localhost:3000',
  
  // File size limits (in bytes)
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE) || 10 * 1024 * 1024, // 10MB
  maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE) || 50 * 1024 * 1024, // 50MB
  maxAudioSize: parseInt(process.env.MAX_AUDIO_SIZE) || 10 * 1024 * 1024, // 10MB
  
  // Duration limits (in seconds)
  maxVideoDuration: parseInt(process.env.MAX_VIDEO_DURATION) || 10, // 10 seconds
  maxAudioDuration: parseInt(process.env.MAX_AUDIO_DURATION) || 5, // 5 seconds
  
  // Dimension limits
  maxImageDimensions: {
    width: parseInt(process.env.MAX_IMAGE_WIDTH) || 1920,
    height: parseInt(process.env.MAX_IMAGE_HEIGHT) || 1080,
  },
  maxVideoDimensions: {
    width: parseInt(process.env.MAX_VIDEO_WIDTH) || 1920,
    height: parseInt(process.env.MAX_VIDEO_HEIGHT) || 1080,
  },
  
  // Allowed file types
  allowedImageTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  allowedVideoTypes: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
  allowedAudioTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
  ],
  
  // Storage configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', 'gcs', 'azure'
    local: {
      path: process.env.LOCAL_STORAGE_PATH || 'uploads',
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    gcs: {
      bucket: process.env.GCS_BUCKET,
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILENAME,
    },
    azure: {
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    },
  },
  
  // Processing configuration
  processing: {
    enableImageOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true',
    enableVideoCompression: process.env.ENABLE_VIDEO_COMPRESSION === 'true',
    enableAudioCompression: process.env.ENABLE_AUDIO_COMPRESSION === 'true',
    
    // Image optimization settings
    imageQuality: parseInt(process.env.IMAGE_QUALITY) || 85,
    imageFormat: process.env.IMAGE_FORMAT || 'auto', // 'auto', 'jpeg', 'png', 'webp'
    
    // Video compression settings
    videoCodec: process.env.VIDEO_CODEC || 'h264',
    videoBitrate: process.env.VIDEO_BITRATE || '1000k',
    videoFps: parseInt(process.env.VIDEO_FPS) || 30,
    
    // Audio compression settings
    audioCodec: process.env.AUDIO_CODEC || 'aac',
    audioBitrate: process.env.AUDIO_BITRATE || '128k',
    audioSampleRate: parseInt(process.env.AUDIO_SAMPLE_RATE) || 44100,
  },
  
  // Security configuration
  security: {
    enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',
    enableFileTypeValidation: process.env.ENABLE_FILE_TYPE_VALIDATION !== 'false',
    enableContentValidation: process.env.ENABLE_CONTENT_VALIDATION === 'true',
    
    // Allowed file extensions
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.mp4', '.webm', '.ogg',
      '.mp3', '.wav', '.ogg',
    ],
    
    // Blocked file extensions
    blockedExtensions: [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
      '.vbs', '.js', '.jar', '.msi', '.dll',
    ],
  },
  
  // Cleanup configuration
  cleanup: {
    enableAutoCleanup: process.env.ENABLE_AUTO_CLEANUP === 'true',
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL) || 24 * 60 * 60 * 1000, // 24 hours
    maxFileAge: parseInt(process.env.MAX_FILE_AGE) || 30 * 24 * 60 * 60 * 1000, // 30 days
    tempFileRetention: parseInt(process.env.TEMP_FILE_RETENTION) || 60 * 60 * 1000, // 1 hour
  },
})); 