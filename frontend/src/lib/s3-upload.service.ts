import { getStoredToken } from './api';

export interface UploadResult {
  url: string;
  s3Key: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class S3UploadService {
  private static readonly UPLOAD_ENDPOINT = '/api/obs-settings/media/upload';

  /**
   * Upload a single file to S3
   */
  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', file.type);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        console.log('S3 Upload Response:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Parsed response:', response);
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } catch (error) {
            console.error('JSON parse error:', error);
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('POST', this.UPLOAD_ENDPOINT);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 300000; // 5 minutes timeout

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple files to S3
   */
  static async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressCallback = onProgress ? (progress: UploadProgress) => onProgress(i, progress) : undefined;
      
      try {
        const result = await this.uploadFile(file, progressCallback);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Check if a URL is an S3 URL or CDN URL
   */
  static isS3Url(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('s3') || 
        urlObj.hostname.includes('amazonaws.com') ||
        urlObj.hostname === 'cdn.xscan.top'
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a URL is a base64 data URL
   */
  static isBase64DataUrl(url: string): boolean {
    return url && url.startsWith('data:') && url.includes('base64,');
  }

  /**
   * Convert S3 URL to CDN URL
   */
  static convertToCdnUrl(s3Url: string): string {
    try {
      const urlObj = new URL(s3Url);
      if (urlObj.hostname.includes('s3') && urlObj.hostname.includes('amazonaws.com')) {
        const key = urlObj.pathname.substring(1); // Remove leading slash
        return `https://cdn.xscan.top/${key}`;
      }
      return s3Url; // Return original if not an S3 URL
    } catch (error) {
      console.warn(`Failed to convert S3 URL to CDN URL: ${s3Url}`);
      return s3Url;
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size must be under 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
      };
    }

    // Check file type
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'
    ];

    if (!supportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Unsupported file type. Supported formats: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM), Audio (MP3, WAV, OGG)'
      };
    }

    return { isValid: true };
  }
}
