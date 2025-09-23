export declare class CreateDonationLevelDto {
    levelName: string;
    minAmount: number;
    maxAmount: number;
    currency?: string;
    isEnabled?: boolean;
    configuration?: {
        imageSettings?: any;
        soundSettings?: any;
        animationSettings?: any;
        styleSettings?: any;
        positionSettings?: any;
        displaySettings?: any;
        generalSettings?: any;
    };
}
export declare class UpdateDonationLevelDto {
    levelName?: string;
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
    isEnabled?: boolean;
    configuration?: {
        imageSettings?: any;
        soundSettings?: any;
        animationSettings?: any;
        styleSettings?: any;
        positionSettings?: any;
        displaySettings?: any;
        generalSettings?: any;
    };
}
export declare class DonationLevelResponseDto {
    levelId: string;
    levelName: string;
    minAmount: number;
    maxAmount: number;
    currency: string;
    isEnabled: boolean;
    configuration: {
        imageSettings?: any;
        soundSettings?: any;
        animationSettings?: any;
        styleSettings?: any;
        positionSettings?: any;
        displaySettings?: any;
        generalSettings?: any;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class DonationLevelFormDto {
    levelName: string;
    minAmount: number;
    maxAmount: number;
    currency?: string;
    isEnabled?: boolean;
    customization?: {
        image?: {
            url?: string;
            type?: 'image' | 'gif' | 'video';
            duration?: number;
        };
        sound?: {
            url?: string;
            volume?: number;
            duration?: number;
        };
        text?: {
            font?: string;
            fontSize?: number;
            color?: string;
            backgroundColor?: string;
            animation?: string;
        };
        position?: string;
        duration?: number;
    };
}
