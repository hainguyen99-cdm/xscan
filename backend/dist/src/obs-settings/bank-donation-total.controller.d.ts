import { Response, Request } from 'express';
import { BankDonationTotalService } from './bank-donation-total.service';
import { OBSWidgetGateway } from './obs-widget.gateway';
export declare class BankDonationTotalController {
    private readonly bankDonationTotalService;
    private readonly obsWidgetGateway;
    constructor(bankDonationTotalService: BankDonationTotalService, obsWidgetGateway: OBSWidgetGateway);
    triggerBankDonationTotalUpdate(streamerId: string): Promise<{
        success: boolean;
        message: string;
        streamerId: string;
        timestamp: string;
    }>;
    getBankDonationTotalWidget(streamerId: string, format: string, theme: string, showStats: string, staticMode: string, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private generateWidgetHtml;
    private generateErrorHtml;
    private getThemeStyles;
    private logger;
}
