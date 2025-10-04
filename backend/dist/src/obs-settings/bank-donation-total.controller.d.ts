import { Response } from 'express';
import { BankDonationTotalService } from './bank-donation-total.service';
export declare class BankDonationTotalController {
    private readonly bankDonationTotalService;
    constructor(bankDonationTotalService: BankDonationTotalService);
    getBankDonationTotalWidget(streamerId: string, format: string, theme: string, showStats: string, res: Response): Promise<Response<any, Record<string, any>>>;
    private generateWidgetHtml;
    private generateErrorHtml;
    private getThemeStyles;
    private logger;
}
