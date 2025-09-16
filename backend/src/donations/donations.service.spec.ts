import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DonationsService } from './donations.service';
import {
  DonationLink,
  DonationLinkDocument,
} from './schemas/donation-link.schema';
import { Donation, DonationDocument } from './schemas/donation.schema';
import { CreateDonationLinkDto } from './dto/create-donation-link.dto';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

// Mock QRCode module
jest.mock('qrcode', () => ({
  toDataURL: jest
    .fn()
    .mockResolvedValue('data:image/png;base64,mocked-qr-code'),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-qr-code-buffer')),
}));

describe('DonationsService', () => {
  let service: DonationsService;
  let donationLinkModel: any;
  let donationModel: any;

  let mockDonationLink: any;

  beforeEach(async () => {
    mockDonationLink = {
      _id: new Types.ObjectId(),
      streamerId: new Types.ObjectId(),
      slug: 'test-slug',
      title: 'Test Donation Link',
      description: 'Test description',
      customUrl: 'https://example.com/donate/test',
      qrCodeUrl: 'data:image/png;base64,mocked-qr-code',
      isActive: true,
      allowAnonymous: true,
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
      },
      totalDonations: 0,
      totalAmount: 0,
      currency: 'USD',
      pageViews: 0,
      socialMediaLinks: [],
      isFeatured: false,
      isExpired: false,
      save: jest.fn(),
    };

    // Set up the save method after creating the object
    mockDonationLink.save.mockResolvedValue(mockDonationLink);

    const mockDonationLinkModel = {
      new: jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockDonationLink),
      })),
      save: jest.fn().mockResolvedValue(mockDonationLink),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      deleteMany: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockDonationLink]),
    };

    const mockDonationModel = {
      aggregate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        {
          provide: getModelToken(DonationLink.name),
          useValue: mockDonationLinkModel,
        },
        {
          provide: getModelToken(Donation.name),
          useValue: mockDonationModel,
        },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    donationLinkModel = module.get<Model<DonationLinkDocument>>(
      getModelToken(DonationLink.name),
    );
    donationModel = module.get<Model<DonationDocument>>(
      getModelToken(Donation.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDonationLink', () => {
    const createDto: CreateDonationLinkDto = {
      slug: 'test-slug',
      title: 'Test Donation Link',
      description: 'Test description',
      customUrl: 'https://example.com/donate/test',
      allowAnonymous: true,
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
      },
      socialMediaLinks: [],
      isFeatured: false,
    };

    it('should throw ConflictException if slug already exists', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValue(mockDonationLink as any);

      await expect(
        service.createDonationLink('507f1f77bcf86cd799439013', createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if custom URL already exists', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockDonationLink as any);

      await expect(
        service.createDonationLink('507f1f77bcf86cd799439013', createDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createBulkDonationLinks', () => {
    const createDtos: CreateDonationLinkDto[] = [
      {
        slug: 'test-slug-1',
        title: 'Test Donation Link 1',
        customUrl: 'https://example.com/donate/test1',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
        },
      },
      {
        slug: 'test-slug-2',
        title: 'Test Donation Link 2',
        customUrl: 'https://example.com/donate/test2',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
        },
      },
    ];

    it('should create multiple donation links successfully', async () => {
      jest
        .spyOn(service, 'createDonationLink')
        .mockResolvedValueOnce(mockDonationLink as any)
        .mockResolvedValueOnce(mockDonationLink as any);

      const result = await service.createBulkDonationLinks(
        '507f1f77bcf86cd799439013',
        createDtos,
      );

      expect(result).toHaveLength(2);
      expect(service.createDonationLink).toHaveBeenCalledTimes(2);
    });

    it('should continue processing even if some links fail', async () => {
      jest
        .spyOn(service, 'createDonationLink')
        .mockResolvedValueOnce(mockDonationLink as any)
        .mockRejectedValueOnce(new Error('Failed to create'));

      const result = await service.createBulkDonationLinks(
        '507f1f77bcf86cd799439013',
        createDtos,
      );

      expect(result).toHaveLength(1);
      expect(service.createDonationLink).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAllDonationLinks', () => {
    it('should return donation links with pagination', async () => {
      jest.spyOn(donationLinkModel, 'countDocuments').mockResolvedValue(1);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue([mockDonationLink] as any);

      const result = await service.findAllDonationLinks(
        '507f1f77bcf86cd799439013',
        true,
        false,
        20,
        1,
      );

      expect(result.donationLinks).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });
  });

  describe('findDonationLinkByCustomUrl', () => {
    it('should return donation link by custom URL', async () => {
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.findDonationLinkByCustomUrl(
        'https://example.com/donate/test',
      );

      expect(result).toBe(mockDonationLink);
    });

    it('should throw NotFoundException if donation link not found', async () => {
      jest.spyOn(donationLinkModel, 'exec').mockResolvedValue(null);

      await expect(
        service.findDonationLinkByCustomUrl('https://example.com/donate/test'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDonationLinkTheme', () => {
    const themeDto = {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    };

    it('should update donation link theme successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValue(mockDonationLink as any);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.updateDonationLinkTheme(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
        themeDto,
      );

      expect(result).toBe(mockDonationLink);
      expect(donationLinkModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { theme: themeDto },
        { new: true },
      );
    });

    it('should throw NotFoundException if donation link not found', async () => {
      jest.spyOn(donationLinkModel, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateDonationLinkTheme(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439013',
          themeDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDonationLinkSocialMedia', () => {
    const socialMediaLinks = [
      'https://twitter.com/test',
      'https://instagram.com/test',
    ];

    it('should update donation link social media links successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValue(mockDonationLink as any);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.updateDonationLinkSocialMedia(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
        socialMediaLinks,
      );

      expect(result).toBe(mockDonationLink);
      expect(donationLinkModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { socialMediaLinks },
        { new: true },
      );
    });
  });

  describe('deleteBulkDonationLinks', () => {
    const ids = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];

    it('should delete multiple donation links successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'find')
        .mockResolvedValue([mockDonationLink, mockDonationLink] as any);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue([mockDonationLink, mockDonationLink] as any);

      await service.deleteBulkDonationLinks(ids, '507f1f77bcf86cd799439013');

      expect(donationLinkModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ids },
      });
    });

    it('should throw NotFoundException if some links not found', async () => {
      jest
        .spyOn(donationLinkModel, 'find')
        .mockResolvedValue([mockDonationLink] as any);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue([mockDonationLink] as any);

      await expect(
        service.deleteBulkDonationLinks(ids, '507f1f77bcf86cd799439013'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleDonationLinkFeatured', () => {
    it('should toggle featured status successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.toggleDonationLinkFeatured(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
      );

      expect(result.isFeatured).toBe(true);
      expect(mockDonationLink.save).toHaveBeenCalled();
    });
  });

  describe('regenerateQRCode', () => {
    it('should regenerate QR code successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findOne')
        .mockResolvedValue(mockDonationLink as any);
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.regenerateQRCode(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
      );

      expect(result).toBe(mockDonationLink);
      expect(donationLinkModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('generateQRCodeBuffer', () => {
    it('should generate QR code buffer successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findById')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.generateQRCodeBuffer('link-id');

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw NotFoundException if donation link not found', async () => {
      jest.spyOn(donationLinkModel, 'findById').mockResolvedValue(null);

      await expect(service.generateQRCodeBuffer('link-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSocialShareData', () => {
    it('should return social share data successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findById')
        .mockResolvedValue(mockDonationLink as any);

      const result = await service.getSocialShareData('link-id');

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('image');
      expect(result).toHaveProperty('socialMediaLinks');
      expect(result).toHaveProperty('shareText');
    });
  });

  describe('trackAnalyticsEvent', () => {
    const eventData = {
      eventType: 'page_view',
      metadata: { referrer: 'google.com' },
    };

    it('should track analytics event successfully', async () => {
      jest
        .spyOn(donationLinkModel, 'findById')
        .mockResolvedValue(mockDonationLink as any);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.trackAnalyticsEvent('link-id', eventData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics event for donation link link-id:',
        eventData,
      );
    });

    it('should throw NotFoundException if donation link not found', async () => {
      jest.spyOn(donationLinkModel, 'findById').mockResolvedValue(null);

      await expect(
        service.trackAnalyticsEvent('link-id', eventData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFeaturedDonationLinks', () => {
    it('should return featured donation links', async () => {
      jest
        .spyOn(donationLinkModel, 'exec')
        .mockResolvedValue([mockDonationLink] as any);

      const result = await service.getFeaturedDonationLinks(5);

      expect(result).toHaveLength(1);
      expect(donationLinkModel.find).toHaveBeenCalledWith({
        isFeatured: true,
        isActive: true,
        isExpired: false,
      });
    });
  });

  describe('checkExpiredLinks', () => {
    it('should update expired links', async () => {
      const expiredLink = {
        ...mockDonationLink,
        expiresAt: new Date('2020-01-01'),
      };
      jest
        .spyOn(donationLinkModel, 'find')
        .mockResolvedValue([expiredLink] as any);

      await service.checkExpiredLinks();

      expect(expiredLink.isExpired).toBe(true);
      expect(expiredLink.isActive).toBe(false);
      expect(expiredLink.save).toHaveBeenCalled();
    });
  });

  it('should delete donation', async () => {
    const donationId = new Types.ObjectId().toString();
    const mockDonation = { _id: donationId };

    donationModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDonation),
    });
    donationModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDonation),
    });

    await service.deleteDonation(donationId);
    expect(donationModel.findByIdAndDelete).toHaveBeenCalledWith(donationId);
  });

  it('should throw NotFoundException when deleting non-existent donation', async () => {
    const donationId = new Types.ObjectId().toString();

    donationModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.deleteDonation(donationId)).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('Donation History Methods', () => {
    let mockDonations: any[];

    beforeEach(() => {
      mockDonations = [
        {
          _id: new Types.ObjectId(),
          donorId: new Types.ObjectId(),
          streamerId: new Types.ObjectId(),
          donationLinkId: new Types.ObjectId(),
          amount: 50,
          currency: 'USD',
          message: 'Test donation',
          isAnonymous: false,
          status: 'completed',
          paymentMethod: 'stripe',
          processingFee: 2.5,
          netAmount: 47.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          donorId: null,
          streamerId: new Types.ObjectId(),
          donationLinkId: new Types.ObjectId(),
          amount: 25,
          currency: 'USD',
          message: 'Anonymous donation',
          isAnonymous: true,
          status: 'completed',
          paymentMethod: 'wallet',
          processingFee: 0,
          netAmount: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    describe('getDonationHistory', () => {
      it('should return donation history with pagination and summary', async () => {
        const mockPagination = {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1,
        };

        const mockSummary = {
          totalDonations: 2,
          totalAmount: 75,
          totalNetAmount: 72.5,
          totalFees: 2.5,
          averageAmount: 37.5,
          averageNetAmount: 36.25,
          minAmount: 25,
          maxAmount: 50,
        };

        donationModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(2),
        });

        donationModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue(mockDonations),
                }),
              }),
            }),
          }),
        });

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockSummary]),
        });

        const result = await service.getDonationHistory();

        expect(result.donations).toEqual(mockDonations);
        expect(result.pagination).toEqual(mockPagination);
        expect(result.summary).toEqual(mockSummary);
      });

      it('should apply filters correctly', async () => {
        const streamerId = new Types.ObjectId().toString();
        const donorId = new Types.ObjectId().toString();
        const status = 'completed';
        const paymentMethod = 'stripe';
        const currency = 'USD';
        const minAmount = 10;
        const maxAmount = 100;
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');
        const isAnonymous = false;

        donationModel.countDocuments.mockReturnValue({
          exec: jest.fn().mockResolvedValue(1),
        });

        donationModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue([mockDonations[0]]),
                }),
              }),
            }),
          }),
        });

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([{}]),
        });

        await service.getDonationHistory(
          streamerId,
          donorId,
          status,
          paymentMethod,
          currency,
          minAmount,
          maxAmount,
          startDate,
          endDate,
          isAnonymous,
        );

        expect(donationModel.find).toHaveBeenCalledWith({
          streamerId: new Types.ObjectId(streamerId),
          donorId: new Types.ObjectId(donorId),
          status,
          paymentMethod,
          currency,
          amount: { $gte: minAmount, $lte: maxAmount },
          createdAt: { $gte: startDate, $lte: endDate },
          isAnonymous,
        });
      });
    });

    describe('getTopDonors', () => {
      it('should return top donors for a streamer', async () => {
        const streamerId = new Types.ObjectId().toString();
        const mockTopDonors = [
          {
            donorId: new Types.ObjectId(),
            donor: {
              _id: new Types.ObjectId(),
              username: 'topdonor1',
              firstName: 'John',
              lastName: 'Doe',
              profilePicture: 'profile1.jpg',
            },
            totalDonations: 5,
            totalAmount: 250,
            totalNetAmount: 237.5,
            averageAmount: 50,
            lastDonation: new Date(),
            firstDonation: new Date(),
          },
        ];

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTopDonors),
        });

        const result = await service.getTopDonors(streamerId, 10, '30d');

        expect(result).toEqual(mockTopDonors);
        expect(donationModel.aggregate).toHaveBeenCalled();
      });
    });

    describe('getDonationAnalytics', () => {
      it('should return comprehensive donation analytics', async () => {
        const mockAnalytics = {
          overall: [
            {
              totalDonations: 2,
              totalAmount: 75,
              totalNetAmount: 72.5,
              totalFees: 2.5,
              averageAmount: 37.5,
              averageNetAmount: 36.25,
              minAmount: 25,
              maxAmount: 50,
              anonymousDonations: 1,
              namedDonations: 1,
            },
          ],
          paymentMethods: [
            { _id: 'stripe', count: 1, totalAmount: 50, averageAmount: 50 },
            { _id: 'wallet', count: 1, totalAmount: 25, averageAmount: 25 },
          ],
          currencies: [
            { _id: 'USD', count: 2, totalAmount: 75, averageAmount: 37.5 },
          ],
          dailyTrends: [],
          hourlyDistribution: [],
          topDonations: [],
        };

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockAnalytics]),
        });

        const result = await service.getDonationAnalytics();

        expect(result).toEqual(mockAnalytics);
        expect(donationModel.aggregate).toHaveBeenCalled();
      });
    });

    describe('getDonationTrends', () => {
      it('should return donation trends over time', async () => {
        const mockTrends = [
          {
            _id: { year: 2024, month: 1, day: 1 },
            count: 2,
            totalAmount: 75,
            totalNetAmount: 72.5,
            averageAmount: 37.5,
            anonymousCount: 1,
            namedCount: 1,
          },
        ];

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTrends),
        });

        const result = await service.getDonationTrends(undefined, 'daily', 30);

        expect(result).toEqual(mockTrends);
        expect(donationModel.aggregate).toHaveBeenCalled();
      });
    });

    describe('getDonationComparison', () => {
      it('should return donation comparison between time periods', async () => {
        const mockComparison = {
          current: [
            {
              count: 5,
              totalAmount: 250,
              totalNetAmount: 237.5,
              averageAmount: 50,
            },
          ],
          previous: [
            {
              count: 3,
              totalAmount: 150,
              totalNetAmount: 142.5,
              averageAmount: 50,
            },
          ],
        };

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockComparison]),
        });

        const result = await service.getDonationComparison(
          undefined,
          '30d',
          '30d',
        );

        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('previous');
        expect(result).toHaveProperty('changes');
        expect(donationModel.aggregate).toHaveBeenCalled();
      });

      it('should calculate percentage changes correctly', async () => {
        const mockComparison = {
          current: [
            {
              count: 10,
              totalAmount: 500,
              totalNetAmount: 475,
              averageAmount: 50,
            },
          ],
          previous: [
            {
              count: 5,
              totalAmount: 250,
              totalNetAmount: 237.5,
              averageAmount: 50,
            },
          ],
        };

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockComparison]),
        });

        const result = await service.getDonationComparison(
          undefined,
          '30d',
          '30d',
        );

        expect(result.changes.count).toBe(100); // 100% increase
        expect(result.changes.totalAmount).toBe(100); // 100% increase
        expect(result.changes.averageAmount).toBe(0); // No change in average
      });

      it('should handle zero previous values', async () => {
        const mockComparison = {
          current: [
            {
              count: 5,
              totalAmount: 250,
              totalNetAmount: 237.5,
              averageAmount: 50,
            },
          ],
          previous: [
            { count: 0, totalAmount: 0, totalNetAmount: 0, averageAmount: 0 },
          ],
        };

        donationModel.aggregate.mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockComparison]),
        });

        const result = await service.getDonationComparison(
          undefined,
          '30d',
          '30d',
        );

        expect(result.changes.count).toBe(100); // 100% increase from 0
        expect(result.changes.totalAmount).toBe(100); // 100% increase from 0
      });
    });
  });
});
