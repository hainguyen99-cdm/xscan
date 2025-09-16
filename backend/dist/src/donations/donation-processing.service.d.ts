import { Model } from 'mongoose';
import { Donation, DonationDocument } from './schemas/donation.schema';
import { DonationLink, DonationLinkDocument } from './schemas/donation-link.schema';
import { CreateDonationDto } from './dto/create-donation.dto';
import { WalletsService } from '../wallets/wallets.service';
import { PaymentsService } from '../payments/payments.service';
import { DonationsGateway } from './donations.gateway';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import { OBSWidgetGateway } from '../obs-settings/obs-widget.gateway';
export interface DonationProcessingResult {
    donation: Donation;
    paymentResult?: any;
    walletUpdateResult?: any;
    alertSent: boolean;
}
export interface DonationValidationResult {
    isValid: boolean;
    errors: string[];
    donationLink?: DonationLink;
    streamerWallet?: any;
}
export declare class DonationProcessingService {
    private donationModel;
    private donationLinkModel;
    private readonly walletsService;
    private readonly paymentsService;
    private readonly donationsGateway;
    private readonly usersService;
    private readonly configService;
    private readonly obsWidgetGateway;
    private readonly logger;
    constructor(donationModel: Model<DonationDocument>, donationLinkModel: Model<DonationLinkDocument>, walletsService: WalletsService, paymentsService: PaymentsService, donationsGateway: DonationsGateway, usersService: UsersService, configService: ConfigService, obsWidgetGateway: OBSWidgetGateway);
    processDonation(createDto: CreateDonationDto): Promise<DonationProcessingResult>;
    private validateDonationRequest;
    private createDonationRecord;
    private processPayment;
    private processWalletPayment;
    private processStripePayment;
    private processPayPalPayment;
    private updateStreamerWallet;
    private completeDonation;
    private markDonationAsFailed;
    private triggerOBSAlert;
    private updateDonationLinkStats;
    private calculateProcessingFee;
    confirmExternalPayment(donationId: string, paymentIntentId: string): Promise<DonationProcessingResult>;
    getProcessingStatus(donationId: string): Promise<any>;
}
