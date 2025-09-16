export declare class ImageSettingsResponseDto {
    enabled: boolean;
    url?: string;
    mediaType: 'image' | 'gif' | 'video';
    width: number;
    height: number;
    borderRadius: number;
    shadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
}
export declare class SoundSettingsResponseDto {
    enabled: boolean;
    url?: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    loop: boolean;
}
export declare class AnimationSettingsResponseDto {
    enabled: boolean;
    animationType: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
    duration: number;
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    direction: 'left' | 'right' | 'top' | 'bottom';
    bounceIntensity: number;
    zoomScale: number;
}
export declare class StyleSettingsResponseDto {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: 'normal' | 'italic';
    textShadow: boolean;
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
}
export declare class PositionSettingsResponseDto {
    x: number;
    y: number;
    anchor: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    zIndex: number;
    responsive: boolean;
    mobileScale: number;
}
export declare class DisplaySettingsResponseDto {
    duration: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    autoHide: boolean;
    showProgress: boolean;
    progressColor: string;
    progressHeight: number;
}
export declare class GeneralSettingsResponseDto {
    enabled: boolean;
    maxAlerts: number;
    alertSpacing: number;
    cooldown: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
export declare class OBSSettingsResponseDto {
    _id: string;
    streamerId: string;
    alertToken: string;
    imageSettings: ImageSettingsResponseDto;
    soundSettings: SoundSettingsResponseDto;
    animationSettings: AnimationSettingsResponseDto;
    styleSettings: StyleSettingsResponseDto;
    positionSettings: PositionSettingsResponseDto;
    displaySettings: DisplaySettingsResponseDto;
    generalSettings: GeneralSettingsResponseDto;
    isActive: boolean;
    lastUsedAt?: Date;
    totalAlerts: number;
    createdAt: Date;
    updatedAt: Date;
}
