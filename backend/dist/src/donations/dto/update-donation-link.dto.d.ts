import { CreateDonationLinkDto, ThemeDto } from './create-donation-link.dto';
declare const UpdateDonationLinkDto_base: import("@nestjs/common").Type<Partial<CreateDonationLinkDto>>;
export declare class UpdateDonationLinkDto extends UpdateDonationLinkDto_base {
    qrCodeUrl?: string;
}
declare const UpdateThemeDto_base: import("@nestjs/common").Type<Partial<ThemeDto>>;
export declare class UpdateThemeDto extends UpdateThemeDto_base {
}
export declare class UpdateSocialMediaDto {
    socialMediaLinks?: string[];
}
export declare class AnalyticsEventDto {
    eventType: string;
    metadata?: any;
}
export {};
