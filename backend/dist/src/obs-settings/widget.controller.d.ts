import { OBSSettingsService } from './obs-settings.service';
import { Response } from 'express';
export declare class WidgetController {
    private readonly obsSettingsService;
    constructor(obsSettingsService: OBSSettingsService);
    getWidgetWithStreamerId(streamerId: string, alertToken: string, res: Response): Promise<void>;
    serveWidget(streamerId: string, alertToken: string, res: Response): Promise<void>;
    getWidget(alertToken: string, res: Response): Promise<void>;
    private escapeFontFamily;
    private generateWidgetHtml;
}
