import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import {
  DonationLink,
  DonationLinkDocument,
} from './schemas/donation-link.schema';
import { Donation, DonationDocument } from './schemas/donation.schema';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import { UpdateDonationLinkDto } from './dto/update-donation-link.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectModel(DonationLink.name)
    private donationLinkModel: Model<DonationLinkDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createDonationLink(
    streamerId: string,
    createDto: CreateDonationLinkDto,
  ): Promise<DonationLink> {
    // Check if slug already exists
    const existingSlug = await this.donationLinkModel.findOne({
      slug: createDto.slug,
    });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    // Check if custom URL already exists
    const existingUrl = await this.donationLinkModel.findOne({
      customUrl: createDto.customUrl,
    });
    if (existingUrl) {
      throw new ConflictException('Custom URL already exists');
    }

    // Generate QR code for the donation link
    const qrCodeUrl = await this.generateQRCode(createDto.customUrl);

    // Check if this is the first donation link for this streamer
    const existingLinksCount = await this.donationLinkModel.countDocuments({
      streamerId: new Types.ObjectId(streamerId),
    });

    // Create the donation link
    const donationLink = new this.donationLinkModel({
      ...createDto,
      streamerId: new Types.ObjectId(streamerId),
      qrCodeUrl,
      isActive: true,
      totalDonations: 0,
      totalAmount: 0,
      currency: 'VND',
      pageViews: 0,
      socialMediaLinks: createDto.socialMediaLinks || [],
      isFeatured: createDto.isFeatured || false,
      isExpired: false,
      isDefault: existingLinksCount === 0, // Set as default if it's the first link
    });

    return donationLink.save();
  }

  async setDefaultDonationLink(streamerId: string, linkId: string): Promise<DonationLink> {
    const userObjectId = new Types.ObjectId(streamerId);
    const linkObjectId = new Types.ObjectId(linkId);

    // Unset current default for this streamer
    await this.donationLinkModel.updateMany(
      { streamerId: userObjectId, isDefault: true },
      { isDefault: false },
    );

    const updated = await this.donationLinkModel.findOneAndUpdate(
      { _id: linkObjectId, streamerId: userObjectId },
      { isDefault: true },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Donation link not found');
    }

    return updated;
  }

  async createBulkDonationLinks(
    streamerId: string,
    createDtos: CreateDonationLinkDto[],
  ): Promise<DonationLink[]> {
    const donationLinks: DonationLink[] = [];

    for (const createDto of createDtos) {
      try {
        const donationLink = await this.createDonationLink(
          streamerId,
          createDto,
        );
        donationLinks.push(donationLink);
      } catch (error) {
        // Log error but continue with other links
        console.error(`Failed to create donation link: ${error.message}`);
      }
    }

    return donationLinks;
  }

  async findAllDonationLinks(
    streamerId?: string,
    isActive?: boolean,
    isFeatured?: boolean,
    limit: number = 20,
    page: number = 1,
  ): Promise<{ donationLinks: DonationLink[]; pagination: any }> {
    const filter: any = {};

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;
    const total = await this.donationLinkModel.countDocuments(filter);

    // Sort by isDefault first (descending) when filtering by streamerId, then by createdAt
    const sortOrder = streamerId 
      ? { isDefault: -1 as const, createdAt: -1 as const }
      : { createdAt: -1 as const };

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

  async findDonationLinkById(id: string): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel
      .findById(id)
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    if (!donationLink) {
      throw new NotFoundException('Donation link not found');
    }

    return donationLink;
  }

  async findDonationLinkBySlug(slug: string): Promise<any> {
    const donationLink = await this.donationLinkModel
      .findOne({ slug, isActive: true, isExpired: false })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or inactive');
    }

    // Get follower count if streamer exists
    let followers = 0;
    if (donationLink.streamerId && typeof donationLink.streamerId === 'object' && 'username' in donationLink.streamerId) {
      try {
        const streamerProfile = await this.usersService.getStreamerProfile(
          (donationLink.streamerId as any).username,
        );
        followers = streamerProfile.followers;
      } catch (error) {
        // If streamer profile not found, keep followers as 0
        console.warn(`Could not get follower count for streamer: ${(donationLink.streamerId as any).username}`);
      }
    }

    // Return donation link with follower count
    return {
      ...donationLink.toObject(),
      followers,
    };
  }

  async findDonationLinkByCustomUrl(customUrl: string): Promise<any> {
    const donationLink = await this.donationLinkModel
      .findOne({ customUrl, isActive: true, isExpired: false })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or inactive');
    }

    // Get follower count if streamer exists
    let followers = 0;
    if (donationLink.streamerId && typeof donationLink.streamerId === 'object' && 'username' in donationLink.streamerId) {
      try {
        const streamerProfile = await this.usersService.getStreamerProfile(
          (donationLink.streamerId as any).username,
        );
        followers = streamerProfile.followers;
      } catch (error) {
        // If streamer profile not found, keep followers as 0
        console.warn(`Could not get follower count for streamer: ${(donationLink.streamerId as any).username}`);
      }
    }

    // Return donation link with follower count
    return {
      ...donationLink.toObject(),
      followers,
    };
  }

  async updateDonationLink(
    id: string,
    streamerId: string,
    updateDto: UpdateDonationLinkDto,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    // Check for conflicts if slug or custom URL is being updated
    if (updateDto.slug && updateDto.slug !== donationLink.slug) {
      const existingSlug = await this.donationLinkModel.findOne({
        slug: updateDto.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    if (updateDto.customUrl && updateDto.customUrl !== donationLink.customUrl) {
      const existingUrl = await this.donationLinkModel.findOne({
        customUrl: updateDto.customUrl,
        _id: { $ne: id },
      });
      if (existingUrl) {
        throw new ConflictException('Custom URL already exists');
      }

      // Generate new QR code if URL changes
      const newQrCodeUrl = await this.generateQRCode(updateDto.customUrl);
      updateDto = { ...updateDto, qrCodeUrl: newQrCodeUrl };
    }

    const updatedDonationLink = await this.donationLinkModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    return updatedDonationLink;
  }

  async updateDonationLinkTheme(
    id: string,
    streamerId: string,
    themeDto: any,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    const updatedDonationLink = await this.donationLinkModel
      .findByIdAndUpdate(id, { theme: themeDto }, { new: true })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    return updatedDonationLink;
  }

  async updateDonationLinkSocialMedia(
    id: string,
    streamerId: string,
    socialMediaLinks: string[],
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    const updatedDonationLink = await this.donationLinkModel
      .findByIdAndUpdate(id, { socialMediaLinks }, { new: true })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    return updatedDonationLink;
  }

  async deleteDonationLink(id: string, streamerId: string): Promise<void> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    await this.donationLinkModel.findByIdAndDelete(id);
  }

  async deleteBulkDonationLinks(
    ids: string[],
    streamerId: string,
  ): Promise<void> {
    const donationLinks = await this.donationLinkModel.find({
      _id: { $in: ids },
      streamerId: new Types.ObjectId(streamerId),
    });

    if (donationLinks.length !== ids.length) {
      throw new NotFoundException(
        'Some donation links not found or access denied',
      );
    }

    await this.donationLinkModel.deleteMany({ _id: { $in: ids } });
  }

  async toggleDonationLinkStatus(
    id: string,
    streamerId: string,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    donationLink.isActive = !donationLink.isActive;
    return donationLink.save();
  }

  async toggleDonationLinkFeatured(
    id: string,
    streamerId: string,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    donationLink.isFeatured = !donationLink.isFeatured;
    return donationLink.save();
  }

  async incrementPageViews(id: string): Promise<void> {
    await this.donationLinkModel.findByIdAndUpdate(id, {
      $inc: { pageViews: 1 },
    });
  }

  async getDonationLinkStats(id: string, streamerId: string): Promise<any> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    // Get donation statistics
    const donationStats = await this.donationModel.aggregate([
      { $match: { donationLinkId: new Types.ObjectId(id) } },
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

  async regenerateQRCode(
    id: string,
    streamerId: string,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    // Generate new QR code
    const newQrCodeUrl = await this.generateQRCode(donationLink.customUrl);

    const updatedDonationLink = await this.donationLinkModel
      .findByIdAndUpdate(id, { qrCodeUrl: newQrCodeUrl }, { new: true })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .exec();

    return updatedDonationLink;
  }

  async generateQRCodeBuffer(id: string): Promise<Buffer> {
    const donationLink = await this.donationLinkModel.findById(id);

    if (!donationLink) {
      throw new NotFoundException('Donation link not found');
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
        width: 512, // Higher resolution for download
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code buffer');
    }
  }

  async getSocialShareData(id: string): Promise<any> {
    const donationLink = await this.donationLinkModel.findById(id);

    if (!donationLink) {
      throw new NotFoundException('Donation link not found');
    }

    // Generate social media sharing data
    const shareData = {
      title: donationLink.title,
      description:
        donationLink.description ||
        `Support ${donationLink.streamerId} with a donation`,
      url: donationLink.customUrl,
      image: donationLink.qrCodeUrl,
      socialMediaLinks: donationLink.socialMediaLinks,
      shareText: `Support ${donationLink.streamerId} with a donation! Check out their donation page: ${donationLink.customUrl}`,
    };

    return shareData;
  }

  async trackAnalyticsEvent(
    id: string,
    eventData: { eventType: string; metadata?: any },
  ): Promise<void> {
    const donationLink = await this.donationLinkModel.findById(id);

    if (!donationLink) {
      throw new NotFoundException('Donation link not found');
    }

    // Here you would typically send the analytics event to your analytics service
    // For now, we'll just log it and potentially store it in the database
    console.log(`Analytics event for donation link ${id}:`, eventData);

    // You could also store analytics events in a separate collection
    // await this.analyticsModel.create({
    //   donationLinkId: id,
    //   eventType: eventData.eventType,
    //   metadata: eventData.metadata,
    //   timestamp: new Date(),
    // });
  }

  private async generateQRCode(url: string): Promise<string> {
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
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  // Method to check and update expired donation links
  async checkExpiredLinks(): Promise<void> {
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

  // Method to get featured donation links
  async getFeaturedDonationLinks(limit: number = 10): Promise<DonationLink[]> {
    return this.donationLinkModel
      .find({ isFeatured: true, isActive: true, isExpired: false })
      .populate('streamerId', 'username firstName lastName profilePicture')
      .sort({ totalAmount: -1 })
      .limit(limit)
      .exec();
  }

  // ===== DONATION MANAGEMENT METHODS =====

  private validateDonationData(createDto: CreateDonationDto): void {
    // Validate amount
    if (createDto.amount < 0.01) {
      throw new BadRequestException('Donation amount must be at least 0.01');
    }

    // Validate currency
    const validCurrencies = [
      'VND',
    ];
    if (!validCurrencies.includes(createDto.currency)) {
      throw new BadRequestException('Invalid currency');
    }

    // Validate message length
    if (createDto.message && createDto.message.length > 500) {
      throw new BadRequestException('Message cannot exceed 500 characters');
    }

    // Validate payment method (restrict to wallet only)
    const validPaymentMethods = ['wallet'];
    if (!createDto.paymentMethod) {
      createDto.paymentMethod = 'wallet' as any;
    }
    if (!validPaymentMethods.includes(createDto.paymentMethod as any)) {
      createDto.paymentMethod = 'wallet' as any;
    }
  }

  async createDonation(createDto: CreateDonationDto): Promise<Donation> {
    // Validate donation data
    this.validateDonationData(createDto);

    // Validate that the donation link exists and is active
    const donationLink = await this.donationLinkModel.findById(
      createDto.donationLinkId,
    );
    if (!donationLink) {
      throw new NotFoundException('Donation link not found');
    }
    if (!donationLink.isActive || donationLink.isExpired) {
      throw new BadRequestException('Donation link is not active');
    }

    // Validate streamer ID matches donation link
    if (createDto.streamerId !== donationLink.streamerId.toString()) {
      throw new BadRequestException('Streamer ID does not match donation link');
    }

    // Set default values
    const donationData = {
      ...createDto,
      donorId: createDto.donorId
        ? new Types.ObjectId(createDto.donorId)
        : undefined,
      streamerId: new Types.ObjectId(createDto.streamerId),
      donationLinkId: new Types.ObjectId(createDto.donationLinkId),
      status: createDto.status || 'pending',
      netAmount: createDto.netAmount || createDto.amount,
      processingFee: createDto.processingFee || 0,
      isAnonymous: createDto.isAnonymous || false,
    };

    // Create the donation
    const donation = new this.donationModel(donationData);
    const savedDonation = await donation.save();

    // Update donation link stats
    await this.updateDonationLinkStats(
      createDto.donationLinkId,
      createDto.amount,
    );

    return savedDonation;
  }

  async findDonations(
    streamerId?: string,
    donorId?: string,
    status?: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<{ donations: Donation[]; pagination: any }> {
    const filter: any = {};

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    if (donorId) {
      filter.donorId = new Types.ObjectId(donorId);
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

  async findDonationById(id: string): Promise<Donation> {
    const donation = await this.donationModel
      .findById(id)
      .populate('donorId', 'username firstName lastName profilePicture')
      .populate('streamerId', 'username firstName lastName profilePicture')
      .populate('donationLinkId', 'title slug customUrl')
      .exec();

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  async updateDonation(
    id: string,
    updateDto: UpdateDonationDto,
  ): Promise<Donation> {
    const donation = await this.donationModel.findById(id);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // Validate status transition if status is being updated
    if (updateDto.status !== undefined) {
      // Check if the status transition is valid
      const validTransitions: Record<string, string[]> = {
        pending: ['completed', 'failed', 'cancelled'],
        completed: ['cancelled'], // Can only cancel completed donations
        failed: ['pending'], // Can retry failed donations
        cancelled: [], // Cancelled donations cannot be changed
      };

      const currentStatus = donation.status;
      const newStatus = updateDto.status;

      if (
        validTransitions[currentStatus] &&
        !validTransitions[currentStatus].includes(newStatus)
      ) {
        throw new BadRequestException(
          `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        );
      }

      donation.status = updateDto.status;

      // Set completion timestamp if status is being updated to completed
      if (updateDto.status === 'completed' && currentStatus !== 'completed') {
        donation.completedAt = new Date();
      }

      // Set failure timestamp if status is being updated to failed
      if (updateDto.status === 'failed' && currentStatus !== 'failed') {
        donation.failedAt = new Date();
      }
    }

    // Update other fields with validation
    if (updateDto.amount !== undefined) {
      if (updateDto.amount < 0.01) {
        throw new BadRequestException('Amount must be at least 0.01');
      }
      donation.amount = updateDto.amount;
    }

    if (updateDto.currency !== undefined) {
      const validCurrencies = [
        'VND',
      ];
      if (!validCurrencies.includes(updateDto.currency)) {
        throw new BadRequestException('Invalid currency');
      }
      donation.currency = updateDto.currency;
    }

    if (updateDto.message !== undefined) {
      if (updateDto.message.length > 500) {
        throw new BadRequestException('Message cannot exceed 500 characters');
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

  async processDonationStatusChange(
    donationId: string,
    newStatus: 'completed' | 'failed' | 'cancelled',
    metadata?: Record<string, any>,
  ): Promise<Donation> {
    const donation = await this.donationModel.findById(donationId);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['completed', 'failed', 'cancelled'],
      completed: ['cancelled'],
      failed: ['pending'],
      cancelled: [],
    };

    const currentStatus = donation.status;
    if (
      validTransitions[currentStatus] &&
      !validTransitions[currentStatus].includes(newStatus)
    ) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      );
    }

    // Update status and timestamps
    donation.status = newStatus;

    if (newStatus === 'completed' && currentStatus !== 'completed') {
      donation.completedAt = new Date();
    } else if (newStatus === 'failed' && currentStatus !== 'failed') {
      donation.failedAt = new Date();
    }

    // Update metadata if provided
    if (metadata) {
      donation.metadata = { ...donation.metadata, ...metadata };
    }

    return await donation.save();
  }

  async deleteDonation(id: string): Promise<void> {
    const donation = await this.donationModel.findById(id);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // Update donation link stats (subtract the donation amount)
    await this.updateDonationLinkStats(
      donation.donationLinkId.toString(),
      -donation.amount,
    );

    await this.donationModel.findByIdAndDelete(id);
  }

  async getDonationStats(
    streamerId?: string,
    timeRange?: string,
  ): Promise<any> {
    const filter: any = { status: 'completed' };

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate: Date;

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
          startDate = new Date(0); // All time
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

    return (
      stats[0] || {
        totalDonations: 0,
        totalAmount: 0,
        totalNetAmount: 0,
        totalFees: 0,
        averageAmount: 0,
        averageNetAmount: 0,
      }
    );
  }

  async getDonationsByCurrency(streamerId?: string): Promise<any[]> {
    const filter: any = { status: 'completed' };

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
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

  private async updateDonationLinkStats(
    donationLinkId: string,
    amount: number,
  ): Promise<void> {
    await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
      $inc: {
        totalDonations: amount > 0 ? 1 : -1,
        totalAmount: amount,
      },
    });
  }

  /**
   * Find donation by payment intent ID
   */
  async findDonationByPaymentIntent(
    paymentIntentId: string,
  ): Promise<Donation> {
    const donation = await this.donationModel.findOne({ paymentIntentId });
    if (!donation) {
      throw new NotFoundException('Donation not found for payment intent');
    }
    return donation;
  }

  /**
   * Get comprehensive donation history with advanced filtering
   */
  async getDonationHistory(
    streamerId?: string,
    donorId?: string,
    status?: string,
    paymentMethod?: string,
    currency?: string,
    minAmount?: number,
    maxAmount?: number,
    startDate?: Date,
    endDate?: Date,
    isAnonymous?: boolean,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 20,
    page: number = 1,
  ): Promise<{ donations: Donation[]; pagination: any; summary: any }> {
    const filter: any = {};

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    if (donorId) {
      filter.donorId = new Types.ObjectId(donorId);
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
      if (minAmount !== undefined) filter.amount.$gte = minAmount;
      if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    if (isAnonymous !== undefined) {
      filter.isAnonymous = isAnonymous;
    }

    const skip = (page - 1) * limit;
    const total = await this.donationModel.countDocuments(filter);

    // Build sort object
    const sort: any = {};
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

    // Calculate summary statistics
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

  /**
   * Get top donors for a streamer
   */
  async getTopDonors(
    streamerId: string,
    limit: number = 10,
    timeRange?: string,
  ): Promise<any[]> {
    const filter: any = {
      streamerId: new Types.ObjectId(streamerId),
      status: 'completed',
      isAnonymous: false,
    };

    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate: Date;

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
          startDate = new Date(0); // All time
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

  /**
   * Get donation analytics with detailed insights
   */
  async getDonationAnalytics(
    streamerId?: string,
    timeRange?: string,
  ): Promise<any> {
    const filter: any = { status: 'completed' };

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate: Date;

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
          startDate = new Date(0); // All time
      }

      filter.createdAt = { $gte: startDate };
    }

    const analytics = await this.donationModel.aggregate([
      { $match: filter },
      {
        $facet: {
          // Overall statistics
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
          // Payment method breakdown
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
          // Currency breakdown
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
          // Daily trends
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
            { $limit: 30 }, // Last 30 days
          ],
          // Hourly distribution
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
          // Top donation amounts
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

  /**
   * Get donation trends over time
   */
  async getDonationTrends(
    streamerId?: string,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30,
  ): Promise<any[]> {
    const filter: any = { status: 'completed' };

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    // Set date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: startDate, $lte: endDate };

    let groupId: any;
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

  /**
   * Get donation comparison between time periods
   */
  async getDonationComparison(
    streamerId?: string,
    currentPeriod: string = '30d',
    previousPeriod: string = '30d',
  ): Promise<any> {
    const filter: any = { status: 'completed' };

    if (streamerId) {
      filter.streamerId = new Types.ObjectId(streamerId);
    }

    const now = new Date();

    // Calculate current period dates
    let currentStartDate: Date;
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

    // Calculate previous period dates
    const currentPeriodDuration = now.getTime() - currentStartDate.getTime();
    const previousEndDate = currentStartDate;
    const previousStartDate = new Date(
      previousEndDate.getTime() - currentPeriodDuration,
    );

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

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current,
      previous,
      changes: {
        count: calculateChange(current.count, previous.count),
        totalAmount: calculateChange(current.totalAmount, previous.totalAmount),
        totalNetAmount: calculateChange(
          current.totalNetAmount,
          previous.totalNetAmount,
        ),
        averageAmount: calculateChange(
          current.averageAmount,
          previous.averageAmount,
        ),
      },
    };
  }

  async getDonationLinks(
    streamerId: string,
    options: { page?: number; limit?: number; search?: string; status?: string },
  ): Promise<{ donationLinks: DonationLink[]; pagination: any }> {
    const { page = 1, limit = 10, search, status } = options;
    const filter: any = { streamerId: new Types.ObjectId(streamerId) };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
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

  async getDonationLink(id: string, streamerId: string): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    }).populate('streamerId', 'username firstName lastName profilePicture');

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    return donationLink;
  }

  async updateTheme(
    id: string,
    streamerId: string,
    themeDto: any,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    // Update theme properties (only the ones that exist in the schema)
    if (themeDto.primaryColor) donationLink.theme.primaryColor = themeDto.primaryColor;
    if (themeDto.secondaryColor) donationLink.theme.secondaryColor = themeDto.secondaryColor;
    if (themeDto.backgroundColor) donationLink.theme.backgroundColor = themeDto.backgroundColor;
    if (themeDto.textColor) donationLink.theme.textColor = themeDto.textColor;

    return donationLink.save();
  }

  async updateSocialMedia(
    id: string,
    streamerId: string,
    socialMediaDto: any,
  ): Promise<DonationLink> {
    const donationLink = await this.donationLinkModel.findOne({
      _id: id,
      streamerId: new Types.ObjectId(streamerId),
    });

    if (!donationLink) {
      throw new NotFoundException('Donation link not found or access denied');
    }

    // Update social media links (array of strings)
    const socialMediaLinks: string[] = [];
    if (socialMediaDto.twitter) socialMediaLinks.push(socialMediaDto.twitter);
    if (socialMediaDto.facebook) socialMediaLinks.push(socialMediaDto.facebook);
    if (socialMediaDto.instagram) socialMediaLinks.push(socialMediaDto.instagram);
    if (socialMediaDto.youtube) socialMediaLinks.push(socialMediaDto.youtube);
    if (socialMediaDto.twitch) socialMediaLinks.push(socialMediaDto.twitch);
    if (socialMediaDto.tiktok) socialMediaLinks.push(socialMediaDto.tiktok);
    if (socialMediaDto.discord) socialMediaLinks.push(socialMediaDto.discord);
    if (socialMediaDto.website) socialMediaLinks.push(socialMediaDto.website);

    donationLink.socialMediaLinks = socialMediaLinks;
    return donationLink.save();
  }

  async checkUrlAvailability(url: string, streamerId: string): Promise<boolean> {
    const existingLink = await this.donationLinkModel.findOne({
      customUrl: url,
      streamerId: { $ne: new Types.ObjectId(streamerId) },
    });

    return !existingLink;
  }
}
