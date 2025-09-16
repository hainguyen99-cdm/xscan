export declare class ImageCustomizationDto {
    url?: string;
    type?: 'image' | 'gif' | 'video';
    duration?: number;
}
export declare class SoundCustomizationDto {
    url?: string;
    volume?: number;
    duration?: number;
}
export declare class TextCustomizationDto {
    font?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    animation?: 'fade' | 'slide' | 'bounce' | 'none';
}
export declare class CustomizationDto {
    image?: ImageCustomizationDto;
    sound?: SoundCustomizationDto;
    text?: TextCustomizationDto;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    duration?: number;
}
export declare class UpdateOBSSettingsDto {
    alertToken?: string;
    customization?: CustomizationDto;
}
