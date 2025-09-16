import { OBSSettingsService } from './obs-settings.service';
import { Response } from 'express';
export declare class WidgetPublicController {
    private readonly obsSettingsService;
    constructor(obsSettingsService: OBSSettingsService);
    testRoute(): Promise<{
        message: string;
        timestamp: string;
    }>;
    serveWidget(streamerId: string, alertToken: string, res: Response): Promise<void>;
    private escapeFontFamily;
    private generateWidgetHtml;
}
