import { DonationsService } from './donations.service';
import { AnalyticsService } from './analytics.service';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import { UpdateDonationLinkDto, UpdateThemeDto, UpdateSocialMediaDto } from './dto/update-donation-link.dto';
export declare class DonationLinksController {
    private readonly donationsService;
    private readonly analyticsService;
    constructor(donationsService: DonationsService, analyticsService: AnalyticsService);
    getDonationLinks(req: any, page?: number, limit?: number, search?: string, status?: string): Promise<{
        success: boolean;
        data: {
            donationLinks: import("./schemas/donation-link.schema").DonationLink[];
            pagination: any;
        };
    }>;
    checkUrlAvailability(url: string, req: any): Promise<{
        success: boolean;
        data: {
            isAvailable: boolean;
        };
    }>;
    getDonationLink(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
    }>;
    createDonationLink(req: any, createDto: CreateDonationLinkDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    updateDonationLink(id: string, req: any, updateDto: UpdateDonationLinkDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    deleteDonationLink(id: string, req: any): Promise<void>;
    updateTheme(id: string, req: any, themeDto: UpdateThemeDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    updateSocialMedia(id: string, req: any, socialMediaDto: UpdateSocialMediaDto): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    toggleDonationLinkStatus(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    toggleDonationLinkFeatured(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/donation-link.schema").DonationLink;
        message: string;
    }>;
    getDonationLinkStats(id: string, req: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
