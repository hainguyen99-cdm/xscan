declare const _default: (() => {
    uploadDir: string;
    cdnBaseUrl: string;
    maxImageSize: number;
    maxVideoSize: number;
    maxAudioSize: number;
    maxVideoDuration: number;
    maxAudioDuration: number;
    maxImageDimensions: {
        width: number;
        height: number;
    };
    maxVideoDimensions: {
        width: number;
        height: number;
    };
    allowedImageTypes: string[];
    allowedVideoTypes: string[];
    allowedAudioTypes: string[];
    storage: {
        type: string;
        local: {
            path: string;
        };
        s3: {
            bucket: string;
            region: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
        gcs: {
            bucket: string;
            projectId: string;
            keyFilename: string;
        };
        azure: {
            accountName: string;
            accountKey: string;
            containerName: string;
        };
    };
    processing: {
        enableImageOptimization: boolean;
        enableVideoCompression: boolean;
        enableAudioCompression: boolean;
        imageQuality: number;
        imageFormat: string;
        videoCodec: string;
        videoBitrate: string;
        videoFps: number;
        audioCodec: string;
        audioBitrate: string;
        audioSampleRate: number;
    };
    security: {
        enableVirusScan: boolean;
        enableFileTypeValidation: boolean;
        enableContentValidation: boolean;
        allowedExtensions: string[];
        blockedExtensions: string[];
    };
    cleanup: {
        enableAutoCleanup: boolean;
        cleanupInterval: number;
        maxFileAge: number;
        tempFileRetention: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uploadDir: string;
    cdnBaseUrl: string;
    maxImageSize: number;
    maxVideoSize: number;
    maxAudioSize: number;
    maxVideoDuration: number;
    maxAudioDuration: number;
    maxImageDimensions: {
        width: number;
        height: number;
    };
    maxVideoDimensions: {
        width: number;
        height: number;
    };
    allowedImageTypes: string[];
    allowedVideoTypes: string[];
    allowedAudioTypes: string[];
    storage: {
        type: string;
        local: {
            path: string;
        };
        s3: {
            bucket: string;
            region: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
        gcs: {
            bucket: string;
            projectId: string;
            keyFilename: string;
        };
        azure: {
            accountName: string;
            accountKey: string;
            containerName: string;
        };
    };
    processing: {
        enableImageOptimization: boolean;
        enableVideoCompression: boolean;
        enableAudioCompression: boolean;
        imageQuality: number;
        imageFormat: string;
        videoCodec: string;
        videoBitrate: string;
        videoFps: number;
        audioCodec: string;
        audioBitrate: string;
        audioSampleRate: number;
    };
    security: {
        enableVirusScan: boolean;
        enableFileTypeValidation: boolean;
        enableContentValidation: boolean;
        allowedExtensions: string[];
        blockedExtensions: string[];
    };
    cleanup: {
        enableAutoCleanup: boolean;
        cleanupInterval: number;
        maxFileAge: number;
        tempFileRetention: number;
    };
}>;
export default _default;
