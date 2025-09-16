export declare class WidgetUrlResponseDto {
    widgetUrl: string;
    streamerId: string;
    alertToken: string;
}
export declare class WidgetConnectionStatusDto {
    connectedWidgets: number;
    isConnected: boolean;
    lastConnected?: string;
}
export declare class FullWidgetUrlResponseDto {
    widgetUrl: string;
    streamerId: string;
    alertToken: string;
    fullUrl: string;
}
export declare class TokenVerificationResponseDto {
    isValid: boolean;
    streamerId: string;
    alertToken: string;
    widgetUrl: string;
    message: string;
}
export declare class TokenRenderResponseDto {
    streamerId: string;
    alertToken: string;
    widgetUrl: string;
    message: string;
}
