"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const QRCode = require("qrcode");
const donation_link_schema_1 = require("./schemas/donation-link.schema");
const donation_schema_1 = require("./schemas/donation.schema");
const users_service_1 = require("../users/users.service");
let DonationsService = class DonationsService {
    constructor(donationLinkModel, donationModel, usersService) {
        this.donationLinkModel = donationLinkModel;
        this.donationModel = donationModel;
        this.usersService = usersService;
    }
    async createDonationLink(streamerId, createDto) {
        const existingSlug = await this.donationLinkModel.findOne({
            slug: createDto.slug,
        });
        if (existingSlug) {
            throw new common_1.ConflictException('Slug already exists');
        }
        const existingUrl = await this.donationLinkModel.findOne({
            customUrl: createDto.customUrl,
        });
        if (existingUrl) {
            throw new common_1.ConflictException('Custom URL already exists');
        }
        const qrCodeUrl = await this.generateQRCode(createDto.customUrl);
        const existingLinksCount = await this.donationLinkModel.countDocuments({
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        const donationLink = new this.donationLinkModel({
            ...createDto,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
            qrCodeUrl,
            isActive: true,
            totalDonations: 0,
            totalAmount: 0,
            currency: 'VND',
            pageViews: 0,
            socialMediaLinks: createDto.socialMediaLinks || [],
            isFeatured: createDto.isFeatured || false,
            isExpired: false,
            isDefault: existingLinksCount === 0,
        });
        return donationLink.save();
    }
    async setDefaultDonationLink(streamerId, linkId) {
        const userObjectId = new mongoose_2.Types.ObjectId(streamerId);
        const linkObjectId = new mongoose_2.Types.ObjectId(linkId);
        await this.donationLinkModel.updateMany({ streamerId: userObjectId, isDefault: true }, { isDefault: false });
        const updated = await this.donationLinkModel.findOneAndUpdate({ _id: linkObjectId, streamerId: userObjectId }, { isDefault: true }, { new: true });
        if (!updated) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        return updated;
    }
    async createBulkDonationLinks(streamerId, createDtos) {
        const donationLinks = [];
        for (const createDto of createDtos) {
            try {
                const donationLink = await this.createDonationLink(streamerId, createDto);
                donationLinks.push(donationLink);
            }
            catch (error) {
                console.error(`Failed to create donation link: ${error.message}`);
            }
        }
        return donationLinks;
    }
    async findAllDonationLinks(streamerId, isActive, isFeatured, limit = 20, page = 1) {
        const filter = {};
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }
        if (isFeatured !== undefined) {
            filter.isFeatured = isFeatured;
        }
        const skip = (page - 1) * limit;
        const total = await this.donationLinkModel.countDocuments(filter);
        const sortOrder = streamerId
            ? { isDefault: -1, createdAt: -1 }
            : { createdAt: -1 };
        const donationLinks = await this.donationLinkModel
            .find(filter)
            .populate('streamerId', 'username firstName lastName profilePicture')
            .sort(sortOrder)
            .skip(skip)
            .limit(limit)
            .exec();
        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
        return { donationLinks, pagination };
    }
    async findDonationLinkById(id) {
        const donationLink = await this.donationLinkModel
            .findById(id)
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        return donationLink;
    }
    async findDonationLinkBySlug(slug) {
        const donationLink = await this.donationLinkModel
            .findOne({ slug, isActive: true, isExpired: false })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or inactive');
        }
        let followers = 0;
        if (donationLink.streamerId && typeof donationLink.streamerId === 'object' && 'username' in donationLink.streamerId) {
            try {
                const streamerProfile = await this.usersService.getStreamerProfile(donationLink.streamerId.username);
                followers = streamerProfile.followers;
            }
            catch (error) {
                console.warn(`Could not get follower count for streamer: ${donationLink.streamerId.username}`);
            }
        }
        return {
            ...donationLink.toObject(),
            followers,
        };
    }
    async findDonationLinkByCustomUrl(customUrl) {
        const donationLink = await this.donationLinkModel
            .findOne({ customUrl, isActive: true, isExpired: false })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or inactive');
        }
        let followers = 0;
        if (donationLink.streamerId && typeof donationLink.streamerId === 'object' && 'username' in donationLink.streamerId) {
            try {
                const streamerProfile = await this.usersService.getStreamerProfile(donationLink.streamerId.username);
                followers = streamerProfile.followers;
            }
            catch (error) {
                console.warn(`Could not get follower count for streamer: ${donationLink.streamerId.username}`);
            }
        }
        return {
            ...donationLink.toObject(),
            followers,
        };
    }
    async updateDonationLink(id, streamerId, updateDto) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        if (updateDto.slug && updateDto.slug !== donationLink.slug) {
            const existingSlug = await this.donationLinkModel.findOne({
                slug: updateDto.slug,
                _id: { $ne: id },
            });
            if (existingSlug) {
                throw new common_1.ConflictException('Slug already exists');
            }
        }
        if (updateDto.customUrl && updateDto.customUrl !== donationLink.customUrl) {
            const existingUrl = await this.donationLinkModel.findOne({
                customUrl: updateDto.customUrl,
                _id: { $ne: id },
            });
            if (existingUrl) {
                throw new common_1.ConflictException('Custom URL already exists');
            }
            const newQrCodeUrl = await this.generateQRCode(updateDto.customUrl);
            updateDto = { ...updateDto, qrCodeUrl: newQrCodeUrl };
        }
        const updatedDonationLink = await this.donationLinkModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        return updatedDonationLink;
    }
    async updateDonationLinkTheme(id, streamerId, themeDto) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        const updatedDonationLink = await this.donationLinkModel
            .findByIdAndUpdate(id, { theme: themeDto }, { new: true })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        return updatedDonationLink;
    }
    async updateDonationLinkSocialMedia(id, streamerId, socialMediaLinks) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        const updatedDonationLink = await this.donationLinkModel
            .findByIdAndUpdate(id, { socialMediaLinks }, { new: true })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        return updatedDonationLink;
    }
    async deleteDonationLink(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        await this.donationLinkModel.findByIdAndDelete(id);
    }
    async deleteBulkDonationLinks(ids, streamerId) {
        const donationLinks = await this.donationLinkModel.find({
            _id: { $in: ids },
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (donationLinks.length !== ids.length) {
            throw new common_1.NotFoundException('Some donation links not found or access denied');
        }
        await this.donationLinkModel.deleteMany({ _id: { $in: ids } });
    }
    async toggleDonationLinkStatus(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        donationLink.isActive = !donationLink.isActive;
        return donationLink.save();
    }
    async toggleDonationLinkFeatured(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        donationLink.isFeatured = !donationLink.isFeatured;
        return donationLink.save();
    }
    async incrementPageViews(id) {
        await this.donationLinkModel.findByIdAndUpdate(id, {
            $inc: { pageViews: 1 },
        });
    }
    async getDonationLinkStats(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        const donationStats = await this.donationModel.aggregate([
            { $match: { donationLinkId: new mongoose_2.Types.ObjectId(id) } },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    anonymousDonations: { $sum: { $cond: ['$isAnonymous', 1, 0] } },
                    namedDonations: { $sum: { $cond: ['$isAnonymous', 0, 1] } },
                },
            },
        ]);
        const stats = donationStats[0] || {
            totalDonations: 0,
            totalAmount: 0,
            averageAmount: 0,
            anonymousDonations: 0,
            namedDonations: 0,
        };
        return {
            ...stats,
            pageViews: donationLink.pageViews,
            currency: donationLink.currency,
            isActive: donationLink.isActive,
            createdAt: donationLink.createdAt,
            lastDonationAt: donationLink.lastDonationAt,
        };
    }
    async regenerateQRCode(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        const newQrCodeUrl = await this.generateQRCode(donationLink.customUrl);
        const updatedDonationLink = await this.donationLinkModel
            .findByIdAndUpdate(id, { qrCodeUrl: newQrCodeUrl }, { new: true })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .exec();
        return updatedDonationLink;
    }
    async generateQRCodeBuffer(id) {
        const donationLink = await this.donationLinkModel.findById(id);
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        try {
            const qrCodeBuffer = await QRCode.toBuffer(donationLink.customUrl, {
                errorCorrectionLevel: 'M',
                type: 'png',
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                width: 512,
            });
            return qrCodeBuffer;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to generate QR code buffer');
        }
    }
    async getSocialShareData(id) {
        const donationLink = await this.donationLinkModel.findById(id);
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        const shareData = {
            title: donationLink.title,
            description: donationLink.description ||
                `Support ${donationLink.streamerId} with a donation`,
            url: donationLink.customUrl,
            image: donationLink.qrCodeUrl,
            socialMediaLinks: donationLink.socialMediaLinks,
            shareText: `Support ${donationLink.streamerId} with a donation! Check out their donation page: ${donationLink.customUrl}`,
        };
        return shareData;
    }
    async trackAnalyticsEvent(id, eventData) {
        const donationLink = await this.donationLinkModel.findById(id);
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        console.log(`Analytics event for donation link ${id}:`, eventData);
    }
    async generateQRCode(url) {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(url, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            return qrCodeDataUrl;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to generate QR code');
        }
    }
    async checkExpiredLinks() {
        const now = new Date();
        const expiredLinks = await this.donationLinkModel.find({
            expiresAt: { $lt: now },
            isExpired: false,
        });
        for (const link of expiredLinks) {
            link.isExpired = true;
            link.isActive = false;
            await link.save();
        }
    }
    async getFeaturedDonationLinks(limit = 10) {
        return this.donationLinkModel
            .find({ isFeatured: true, isActive: true, isExpired: false })
            .populate('streamerId', 'username firstName lastName profilePicture')
            .sort({ totalAmount: -1 })
            .limit(limit)
            .exec();
    }
    validateDonationData(createDto) {
        if (createDto.amount < 0.01) {
            throw new common_1.BadRequestException('Donation amount must be at least 0.01');
        }
        const validCurrencies = [
            'VND',
        ];
        if (!validCurrencies.includes(createDto.currency)) {
            throw new common_1.BadRequestException('Invalid currency');
        }
        if (createDto.message && createDto.message.length > 500) {
            throw new common_1.BadRequestException('Message cannot exceed 500 characters');
        }
        const validPaymentMethods = ['wallet'];
        if (!createDto.paymentMethod) {
            createDto.paymentMethod = 'wallet';
        }
        if (!validPaymentMethods.includes(createDto.paymentMethod)) {
            createDto.paymentMethod = 'wallet';
        }
    }
    async createDonation(createDto) {
        this.validateDonationData(createDto);
        const donationLink = await this.donationLinkModel.findById(createDto.donationLinkId);
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found');
        }
        if (!donationLink.isActive || donationLink.isExpired) {
            throw new common_1.BadRequestException('Donation link is not active');
        }
        if (createDto.streamerId !== donationLink.streamerId.toString()) {
            throw new common_1.BadRequestException('Streamer ID does not match donation link');
        }
        const donationData = {
            ...createDto,
            donorId: createDto.donorId
                ? new mongoose_2.Types.ObjectId(createDto.donorId)
                : undefined,
            streamerId: new mongoose_2.Types.ObjectId(createDto.streamerId),
            donationLinkId: new mongoose_2.Types.ObjectId(createDto.donationLinkId),
            status: createDto.status || 'pending',
            netAmount: createDto.netAmount || createDto.amount,
            processingFee: createDto.processingFee || 0,
            isAnonymous: createDto.isAnonymous || false,
        };
        const donation = new this.donationModel(donationData);
        const savedDonation = await donation.save();
        await this.updateDonationLinkStats(createDto.donationLinkId, createDto.amount);
        return savedDonation;
    }
    async findDonations(streamerId, donorId, status, limit = 20, page = 1) {
        const filter = {};
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        if (donorId) {
            filter.donorId = new mongoose_2.Types.ObjectId(donorId);
        }
        if (status) {
            filter.status = status;
        }
        const skip = (page - 1) * limit;
        const total = await this.donationModel.countDocuments(filter);
        const donations = await this.donationModel
            .find(filter)
            .populate('donorId', 'username firstName lastName profilePicture')
            .populate('streamerId', 'username firstName lastName profilePicture')
            .populate('donationLinkId', 'title slug customUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        };
        return { donations, pagination };
    }
    async findDonationById(id) {
        const donation = await this.donationModel
            .findById(id)
            .populate('donorId', 'username firstName lastName profilePicture')
            .populate('streamerId', 'username firstName lastName profilePicture')
            .populate('donationLinkId', 'title slug customUrl')
            .exec();
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        return donation;
    }
    async updateDonation(id, updateDto) {
        const donation = await this.donationModel.findById(id);
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        if (updateDto.status !== undefined) {
            const validTransitions = {
                pending: ['completed', 'failed', 'cancelled'],
                completed: ['cancelled'],
                failed: ['pending'],
                cancelled: [],
            };
            const currentStatus = donation.status;
            const newStatus = updateDto.status;
            if (validTransitions[currentStatus] &&
                !validTransitions[currentStatus].includes(newStatus)) {
                throw new common_1.BadRequestException(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
            }
            donation.status = updateDto.status;
            if (updateDto.status === 'completed' && currentStatus !== 'completed') {
                donation.completedAt = new Date();
            }
            if (updateDto.status === 'failed' && currentStatus !== 'failed') {
                donation.failedAt = new Date();
            }
        }
        if (updateDto.amount !== undefined) {
            if (updateDto.amount < 0.01) {
                throw new common_1.BadRequestException('Amount must be at least 0.01');
            }
            donation.amount = updateDto.amount;
        }
        if (updateDto.currency !== undefined) {
            const validCurrencies = [
                'VND',
            ];
            if (!validCurrencies.includes(updateDto.currency)) {
                throw new common_1.BadRequestException('Invalid currency');
            }
            donation.currency = updateDto.currency;
        }
        if (updateDto.message !== undefined) {
            if (updateDto.message.length > 500) {
                throw new common_1.BadRequestException('Message cannot exceed 500 characters');
            }
            donation.message = updateDto.message;
        }
        if (updateDto.isAnonymous !== undefined)
            donation.isAnonymous = updateDto.isAnonymous;
        if (updateDto.paymentMethod !== undefined)
            donation.paymentMethod = updateDto.paymentMethod;
        if (updateDto.transactionId !== undefined)
            donation.transactionId = updateDto.transactionId;
        if (updateDto.paymentIntentId !== undefined)
            donation.paymentIntentId = updateDto.paymentIntentId;
        if (updateDto.processingFee !== undefined)
            donation.processingFee = updateDto.processingFee;
        if (updateDto.netAmount !== undefined)
            donation.netAmount = updateDto.netAmount;
        if (updateDto.metadata !== undefined)
            donation.metadata = updateDto.metadata;
        return await donation.save();
    }
    async processDonationStatusChange(donationId, newStatus, metadata) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        const validTransitions = {
            pending: ['completed', 'failed', 'cancelled'],
            completed: ['cancelled'],
            failed: ['pending'],
            cancelled: [],
        };
        const currentStatus = donation.status;
        if (validTransitions[currentStatus] &&
            !validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
        }
        donation.status = newStatus;
        if (newStatus === 'completed' && currentStatus !== 'completed') {
            donation.completedAt = new Date();
        }
        else if (newStatus === 'failed' && currentStatus !== 'failed') {
            donation.failedAt = new Date();
        }
        if (metadata) {
            donation.metadata = { ...donation.metadata, ...metadata };
        }
        return await donation.save();
    }
    async deleteDonation(id) {
        const donation = await this.donationModel.findById(id);
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        await this.updateDonationLinkStats(donation.donationLinkId.toString(), -donation.amount);
        await this.donationModel.findByIdAndDelete(id);
    }
    async getDonationStats(streamerId, timeRange) {
        const filter = { status: 'completed' };
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        if (timeRange) {
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            filter.createdAt = { $gte: startDate };
        }
        const stats = await this.donationModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$netAmount' },
                    totalFees: { $sum: '$processingFee' },
                    averageAmount: { $avg: '$amount' },
                    averageNetAmount: { $avg: '$netAmount' },
                },
            },
        ]);
        return (stats[0] || {
            totalDonations: 0,
            totalAmount: 0,
            totalNetAmount: 0,
            totalFees: 0,
            averageAmount: 0,
            averageNetAmount: 0,
        });
    }
    async getDonationsByCurrency(streamerId) {
        const filter = { status: 'completed' };
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        return this.donationModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$currency',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$netAmount' },
                },
            },
            { $sort: { totalAmount: -1 } },
        ]);
    }
    async updateDonationLinkStats(donationLinkId, amount) {
        await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
            $inc: {
                totalDonations: amount > 0 ? 1 : -1,
                totalAmount: amount,
            },
        });
    }
    async findDonationByPaymentIntent(paymentIntentId) {
        const donation = await this.donationModel.findOne({ paymentIntentId });
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found for payment intent');
        }
        return donation;
    }
    async getDonationHistory(streamerId, donorId, status, paymentMethod, currency, minAmount, maxAmount, startDate, endDate, isAnonymous, sortBy = 'createdAt', sortOrder = 'desc', limit = 20, page = 1) {
        const filter = {};
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        if (donorId) {
            filter.donorId = new mongoose_2.Types.ObjectId(donorId);
        }
        if (status) {
            filter.status = status;
        }
        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }
        if (currency) {
            filter.currency = currency;
        }
        if (minAmount !== undefined || maxAmount !== undefined) {
            filter.amount = {};
            if (minAmount !== undefined)
                filter.amount.$gte = minAmount;
            if (maxAmount !== undefined)
                filter.amount.$lte = maxAmount;
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = startDate;
            if (endDate)
                filter.createdAt.$lte = endDate;
        }
        if (isAnonymous !== undefined) {
            filter.isAnonymous = isAnonymous;
        }
        const skip = (page - 1) * limit;
        const total = await this.donationModel.countDocuments(filter);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const donations = await this.donationModel
            .find(filter)
            .populate('donorId', 'username firstName lastName profilePicture')
            .populate('streamerId', 'username firstName lastName profilePicture')
            .populate('donationLinkId', 'title slug customUrl')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
        const summary = await this.donationModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$netAmount' },
                    totalFees: { $sum: '$processingFee' },
                    averageAmount: { $avg: '$amount' },
                    averageNetAmount: { $avg: '$netAmount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' },
                },
            },
        ]);
        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        };
        return {
            donations,
            pagination,
            summary: summary[0] || {
                totalDonations: 0,
                totalAmount: 0,
                totalNetAmount: 0,
                totalFees: 0,
                averageAmount: 0,
                averageNetAmount: 0,
                minAmount: 0,
                maxAmount: 0,
            },
        };
    }
    async getTopDonors(streamerId, limit = 10, timeRange) {
        const filter = {
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
            status: 'completed',
            isAnonymous: false,
        };
        if (timeRange) {
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            filter.createdAt = { $gte: startDate };
        }
        return this.donationModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$donorId',
                    totalDonations: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$netAmount' },
                    averageAmount: { $avg: '$amount' },
                    lastDonation: { $max: '$createdAt' },
                    firstDonation: { $min: '$createdAt' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'donor',
                },
            },
            {
                $unwind: '$donor',
            },
            {
                $project: {
                    donorId: '$_id',
                    donor: {
                        _id: '$donor._id',
                        username: '$donor.username',
                        firstName: '$donor.firstName',
                        lastName: '$donor.lastName',
                        profilePicture: '$donor.profilePicture',
                    },
                    totalDonations: 1,
                    totalAmount: 1,
                    totalNetAmount: 1,
                    averageAmount: 1,
                    lastDonation: 1,
                    firstDonation: 1,
                },
            },
            { $sort: { totalAmount: -1 } },
            { $limit: limit },
        ]);
    }
    async getDonationAnalytics(streamerId, timeRange) {
        const filter = { status: 'completed' };
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        if (timeRange) {
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            filter.createdAt = { $gte: startDate };
        }
        const analytics = await this.donationModel.aggregate([
            { $match: filter },
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalDonations: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                totalNetAmount: { $sum: '$netAmount' },
                                totalFees: { $sum: '$processingFee' },
                                averageAmount: { $avg: '$amount' },
                                averageNetAmount: { $avg: '$netAmount' },
                                minAmount: { $min: '$amount' },
                                maxAmount: { $max: '$amount' },
                                anonymousDonations: { $sum: { $cond: ['$isAnonymous', 1, 0] } },
                                namedDonations: { $sum: { $cond: ['$isAnonymous', 0, 1] } },
                            },
                        },
                    ],
                    paymentMethods: [
                        {
                            $group: {
                                _id: '$paymentMethod',
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                        { $sort: { totalAmount: -1 } },
                    ],
                    currencies: [
                        {
                            $group: {
                                _id: '$currency',
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                        { $sort: { totalAmount: -1 } },
                    ],
                    dailyTrends: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$createdAt' },
                                    month: { $month: '$createdAt' },
                                    day: { $dayOfMonth: '$createdAt' },
                                },
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
                        { $limit: 30 },
                    ],
                    hourlyDistribution: [
                        {
                            $group: {
                                _id: { $hour: '$createdAt' },
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                    topDonations: [
                        { $sort: { amount: -1 } },
                        { $limit: 10 },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'donorId',
                                foreignField: '_id',
                                as: 'donor',
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'streamerId',
                                foreignField: '_id',
                                as: 'streamer',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: 1,
                                currency: 1,
                                message: 1,
                                isAnonymous: 1,
                                createdAt: 1,
                                donor: { $arrayElemAt: ['$donor', 0] },
                                streamer: { $arrayElemAt: ['$streamer', 0] },
                            },
                        },
                    ],
                },
            },
        ]);
        return analytics[0];
    }
    async getDonationTrends(streamerId, period = 'daily', days = 30) {
        const filter = { status: 'completed' };
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        filter.createdAt = { $gte: startDate, $lte: endDate };
        let groupId;
        switch (period) {
            case 'hourly':
                groupId = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                    hour: { $hour: '$createdAt' },
                };
                break;
            case 'daily':
                groupId = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'weekly':
                groupId = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' },
                };
                break;
            case 'monthly':
                groupId = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
        }
        return this.donationModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: groupId,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$netAmount' },
                    averageAmount: { $avg: '$amount' },
                    anonymousCount: { $sum: { $cond: ['$isAnonymous', 1, 0] } },
                    namedCount: { $sum: { $cond: ['$isAnonymous', 0, 1] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getDonationComparison(streamerId, currentPeriod = '30d', previousPeriod = '30d') {
        const filter = { status: 'completed' };
        if (streamerId) {
            filter.streamerId = new mongoose_2.Types.ObjectId(streamerId);
        }
        const now = new Date();
        let currentStartDate;
        switch (currentPeriod) {
            case '24h':
                currentStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        const currentPeriodDuration = now.getTime() - currentStartDate.getTime();
        const previousEndDate = currentStartDate;
        const previousStartDate = new Date(previousEndDate.getTime() - currentPeriodDuration);
        const comparison = await this.donationModel.aggregate([
            {
                $facet: {
                    current: [
                        {
                            $match: {
                                ...filter,
                                createdAt: { $gte: currentStartDate, $lte: now },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                totalNetAmount: { $sum: '$netAmount' },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                    ],
                    previous: [
                        {
                            $match: {
                                ...filter,
                                createdAt: { $gte: previousStartDate, $lt: previousEndDate },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' },
                                totalNetAmount: { $sum: '$netAmount' },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                    ],
                },
            },
        ]);
        const current = comparison[0].current[0] || {
            count: 0,
            totalAmount: 0,
            totalNetAmount: 0,
            averageAmount: 0,
        };
        const previous = comparison[0].previous[0] || {
            count: 0,
            totalAmount: 0,
            totalNetAmount: 0,
            averageAmount: 0,
        };
        const calculateChange = (current, previous) => {
            if (previous === 0)
                return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };
        return {
            current,
            previous,
            changes: {
                count: calculateChange(current.count, previous.count),
                totalAmount: calculateChange(current.totalAmount, previous.totalAmount),
                totalNetAmount: calculateChange(current.totalNetAmount, previous.totalNetAmount),
                averageAmount: calculateChange(current.averageAmount, previous.averageAmount),
            },
        };
    }
    async getDonationLinks(streamerId, options) {
        const { page = 1, limit = 10, search, status } = options;
        const filter = { streamerId: new mongoose_2.Types.ObjectId(streamerId) };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
            ];
        }
        if (status === 'active') {
            filter.isActive = true;
        }
        else if (status === 'inactive') {
            filter.isActive = false;
        }
        const skip = (page - 1) * limit;
        const total = await this.donationLinkModel.countDocuments(filter);
        const donationLinks = await this.donationLinkModel
            .find(filter)
            .populate('streamerId', 'username firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
        return { donationLinks, pagination };
    }
    async getDonationLink(id, streamerId) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        }).populate('streamerId', 'username firstName lastName profilePicture');
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        return donationLink;
    }
    async updateTheme(id, streamerId, themeDto) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        if (themeDto.primaryColor)
            donationLink.theme.primaryColor = themeDto.primaryColor;
        if (themeDto.secondaryColor)
            donationLink.theme.secondaryColor = themeDto.secondaryColor;
        if (themeDto.backgroundColor)
            donationLink.theme.backgroundColor = themeDto.backgroundColor;
        if (themeDto.textColor)
            donationLink.theme.textColor = themeDto.textColor;
        return donationLink.save();
    }
    async updateSocialMedia(id, streamerId, socialMediaDto) {
        const donationLink = await this.donationLinkModel.findOne({
            _id: id,
            streamerId: new mongoose_2.Types.ObjectId(streamerId),
        });
        if (!donationLink) {
            throw new common_1.NotFoundException('Donation link not found or access denied');
        }
        const socialMediaLinks = [];
        if (socialMediaDto.twitter)
            socialMediaLinks.push(socialMediaDto.twitter);
        if (socialMediaDto.facebook)
            socialMediaLinks.push(socialMediaDto.facebook);
        if (socialMediaDto.instagram)
            socialMediaLinks.push(socialMediaDto.instagram);
        if (socialMediaDto.youtube)
            socialMediaLinks.push(socialMediaDto.youtube);
        if (socialMediaDto.twitch)
            socialMediaLinks.push(socialMediaDto.twitch);
        if (socialMediaDto.tiktok)
            socialMediaLinks.push(socialMediaDto.tiktok);
        if (socialMediaDto.discord)
            socialMediaLinks.push(socialMediaDto.discord);
        if (socialMediaDto.website)
            socialMediaLinks.push(socialMediaDto.website);
        donationLink.socialMediaLinks = socialMediaLinks;
        return donationLink.save();
    }
    async checkUrlAvailability(url, streamerId) {
        const existingLink = await this.donationLinkModel.findOne({
            customUrl: url,
            streamerId: { $ne: new mongoose_2.Types.ObjectId(streamerId) },
        });
        return !existingLink;
    }
};
exports.DonationsService = DonationsService;
exports.DonationsService = DonationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(donation_link_schema_1.DonationLink.name)),
    __param(1, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService])
], DonationsService);
//# sourceMappingURL=donations.service.js.map