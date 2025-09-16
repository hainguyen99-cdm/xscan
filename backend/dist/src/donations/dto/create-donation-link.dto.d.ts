export declare class ThemeDto {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
}
export declare class CreateDonationLinkDto {
    slug: string;
    title: string;
    description?: string;
    customUrl: string;
    allowAnonymous?: boolean;
    theme: ThemeDto;
    socialMediaLinks?: string[];
    isFeatured?: boolean;
    expiresAt?: string;
}
