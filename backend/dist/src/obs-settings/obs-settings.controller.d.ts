import { OBSSettingsService } from './obs-settings.service';
import { CreateOBSSettingsDto, OBSSettingsResponseDto } from './dto';
export declare class OBSSettingsController {
    private readonly obsSettingsService;
    constructor(obsSettingsService: OBSSettingsService);
    create(createOBSSettingsDto: CreateOBSSettingsDto, req: any): Promise<OBSSettingsResponseDto>;
    getMySettings(req: any): Promise<OBSSettingsResponseDto>;
    getDonationLevels(req: any): Promise<{
        donationLevels: any[];
    }>;
    updateDonationLevel(levelId: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
