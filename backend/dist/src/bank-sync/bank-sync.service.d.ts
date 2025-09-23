import { Model } from 'mongoose';
import { BankTransactionDocument } from './schemas/bank-transaction.schema';
import { UsersService } from '../users/users.service';
import { OBSWidgetGateway } from '../obs-settings/obs-widget.gateway';
import { ConfigService } from '../config/config.service';
export declare class BankSyncService {
    private readonly bankTxModel;
    private readonly usersService;
    private readonly obsWidgetGateway;
    private readonly configService;
    private readonly logger;
    private readonly REQUEST_TIMEOUT_MS;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY_MS;
    private readonly DONATION_DISPLAY_MS;
    private readonly alertQueues;
    constructor(bankTxModel: Model<BankTransactionDocument>, usersService: UsersService, obsWidgetGateway: OBSWidgetGateway, configService: ConfigService);
    pollAllStreamers(): Promise<void>;
    private syncStreamerTransactions;
    private fetchVcbTransactions;
    private delay;
    private parseAmount;
    private extractDonorName;
    private extractTransferMessage;
    private enqueueDonation;
    private processQueue;
}
