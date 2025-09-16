export declare class MediaUploadResponseDto {
    filename: string;
    originalName: string;
    url: string;
    type: 'image' | 'gif' | 'video' | 'audio';
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    mimeType: string;
}
export declare class MediaUploadRequestDto {
    streamerId: string;
    mediaType: 'image' | 'gif' | 'video' | 'audio';
}
export declare class MediaDeleteRequestDto {
    filename: string;
    mediaType: 'image' | 'gif' | 'video' | 'audio';
}
export declare class MediaValidationDto {
    maxSize: number;
    allowedTypes: string[];
    maxDuration?: number;
    maxDimensions?: {
        width: number;
        height: number;
    };
}
export declare class MediaSettingsDto {
    enabled: boolean;
    url?: string;
    type?: 'image' | 'gif' | 'video';
    width?: number;
    height?: number;
    borderRadius?: number;
    shadow?: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
}
export declare class AudioSettingsDto {
    enabled: boolean;
    url?: string;
    volume?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
}
export declare class MediaUploadProgressDto {
    progress: number;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    error?: string;
    media?: MediaUploadResponseDto;
}
