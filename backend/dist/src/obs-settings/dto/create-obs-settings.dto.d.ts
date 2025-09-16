export declare class ImageSettingsDto {
    enabled?: boolean;
    url?: string;
    mediaType?: 'image' | 'gif' | 'video';
    width?: number;
    height?: number;
    borderRadius?: number;
    shadow?: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
}
export declare class SoundSettingsDto {
    enabled?: boolean;
    url?: string;
    volume?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
}
export declare class AnimationSettingsDto {
    enabled?: boolean;
    animationType?: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
    duration?: number;
    easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    direction?: 'left' | 'right' | 'top' | 'bottom';
    bounceIntensity?: number;
    zoomScale?: number;
}
export declare class StyleSettingsDto {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    textShadow?: boolean;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffsetX?: number;
    textShadowOffsetY?: number;
}
export declare class PositionSettingsDto {
    x?: number;
    y?: number;
    anchor?: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    zIndex?: number;
    responsive?: boolean;
    mobileScale?: number;
}
export declare class DisplaySettingsDto {
    duration?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
    autoHide?: boolean;
    showProgress?: boolean;
    progressColor?: string;
    progressHeight?: number;
}
export declare class GeneralSettingsDto {
    enabled?: boolean;
    maxAlerts?: number;
    alertSpacing?: number;
    cooldown?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}
export declare class CreateOBSSettingsDto {
    streamerId: string;
    imageSettings?: ImageSettingsDto;
    soundSettings?: SoundSettingsDto;
    animationSettings?: AnimationSettingsDto;
    styleSettings?: StyleSettingsDto;
    positionSettings?: PositionSettingsDto;
    displaySettings?: DisplaySettingsDto;
    generalSettings?: GeneralSettingsDto;
    isActive?: boolean;
}
