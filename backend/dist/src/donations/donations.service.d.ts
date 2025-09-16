import { Model } from 'mongoose';
import { DonationLink, DonationLinkDocument } from './schemas/donation-link.schema';
import { Donation, DonationDocument } from './schemas/donation.schema';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import { UpdateDonationLinkDto } from './dto/update-donation-link.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { UsersService } from '../users/users.service';
export declare class DonationsService {
    private donationLinkModel;
    private donationModel;
    private usersService;
    constructor(donationLinkModel: Model<DonationLinkDocument>, donationModel: Model<DonationDocument>, usersService: UsersService);
    createDonationLink(streamerId: string, createDto: CreateDonationLinkDto): Promise<DonationLink>;
    setDefaultDonationLink(streamerId: string, linkId: string): Promise<DonationLink>;
    createBulkDonationLinks(streamerId: string, createDtos: CreateDonationLinkDto[]): Promise<DonationLink[]>;
    findAllDonationLinks(streamerId?: string, isActive?: boolean, isFeatured?: boolean, limit?: number, page?: number): Promise<{
        donationLinks: DonationLink[];
        pagination: any;
    }>;
    findDonationLinkById(id: string): Promise<DonationLink>;
    findDonationLinkBySlug(slug: string): Promise<any>;
    findDonationLinkByCustomUrl(customUrl: string): Promise<any>;
    updateDonationLink(id: string, streamerId: string, updateDto: UpdateDonationLinkDto): Promise<DonationLink>;
    updateDonationLinkTheme(id: string, streamerId: string, themeDto: any): Promise<DonationLink>;
    updateDonationLinkSocialMedia(id: string, streamerId: string, socialMediaLinks: string[]): Promise<DonationLink>;
    deleteDonationLink(id: string, streamerId: string): Promise<void>;
    deleteBulkDonationLinks(ids: string[], streamerId: string): Promise<void>;
    toggleDonationLinkStatus(id: string, streamerId: string): Promise<DonationLink>;
    toggleDonationLinkFeatured(id: string, streamerId: string): Promise<DonationLink>;
    incrementPageViews(id: string): Promise<void>;
    getDonationLinkStats(id: string, streamerId: string): Promise<any>;
    regenerateQRCode(id: string, streamerId: string): Promise<DonationLink>;
    generateQRCodeBuffer(id: string): Promise<Buffer>;
    getSocialShareData(id: string): Promise<any>;
    trackAnalyticsEvent(id: string, eventData: {
        eventType: string;
        metadata?: any;
    }): Promise<void>;
    private generateQRCode;
    checkExpiredLinks(): Promise<void>;
    getFeaturedDonationLinks(limit?: number): Promise<DonationLink[]>;
    private validateDonationData;
    createDonation(createDto: CreateDonationDto): Promise<Donation>;
    findDonations(streamerId?: string, donorId?: string, status?: string, limit?: number, page?: number): Promise<{
        donations: Donation[];
        pagination: any;
    }>;
    findDonationById(id: string): Promise<Donation>;
    updateDonation(id: string, updateDto: UpdateDonationDto): Promise<Donation>;
    processDonationStatusChange(donationId: string, newStatus: 'completed' | 'failed' | 'cancelled', metadata?: Record<string, any>): Promise<Donation>;
    deleteDonation(id: string): Promise<void>;
    getDonationStats(streamerId?: string, timeRange?: string): Promise<any>;
    getDonationsByCurrency(streamerId?: string): Promise<any[]>;
    private updateDonationLinkStats;
    findDonationByPaymentIntent(paymentIntentId: string): Promise<Donation>;
    getDonationHistory(streamerId?: string, donorId?: string, status?: string, paymentMethod?: string, currency?: string, minAmount?: number, maxAmount?: number, startDate?: Date, endDate?: Date, isAnonymous?: boolean, sortBy?: string, sortOrder?: 'asc' | 'desc', limit?: number, page?: number): Promise<{
        donations: Donation[];
        pagination: any;
        summary: any;
    }>;
    getTopDonors(streamerId: string, limit?: number, timeRange?: string): Promise<any[]>;
    getDonationAnalytics(streamerId?: string, timeRange?: string): Promise<any>;
    getDonationTrends(streamerId?: string, period?: 'hourly' | 'daily' | 'weekly' | 'monthly', days?: number): Promise<any[]>;
    getDonationComparison(streamerId?: string, currentPeriod?: string, previousPeriod?: string): Promise<any>;
    getDonationLinks(streamerId: string, options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        donationLinks: DonationLink[];
        pagination: any;
    }>;
    getDonationLink(id: string, streamerId: string): Promise<DonationLink>;
    updateTheme(id: string, streamerId: string, themeDto: any): Promise<DonationLink>;
    updateSocialMedia(id: string, streamerId: string, socialMediaDto: any): Promise<DonationLink>;
    checkUrlAvailability(url: string, streamerId: string): Promise<boolean>;
}
