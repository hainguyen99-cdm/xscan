import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankDonationTotalController } from '../../src/obs-settings/bank-donation-total.controller';
import { BankDonationTotalService } from '../../src/obs-settings/bank-donation-total.service';
import { BankTransaction, BankTransactionSchema } from '../../src/bank-sync/schemas/bank-transaction.schema';
import * as request from 'supertest';

describe('BankDonationTotalWidget (e2e)', () => {
  let app: INestApplication;
  let bankTransactionModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/xscan-test'),
        MongooseModule.forFeature([
          { name: BankTransaction.name, schema: BankTransactionSchema },
        ]),
      ],
      controllers: [BankDonationTotalController],
      providers: [BankDonationTotalService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bankTransactionModel = moduleFixture.get('BankTransactionModel');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await bankTransactionModel.deleteMany({});
  });

  describe('/widget-public/bank-total/:streamerId (GET)', () => {
    it('should return HTML widget by default', () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      
      return request(app.getHttpServer())
        .get(`/api/widget-public/bank-total/${streamerId}`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect((res) => {
          expect(res.text).toContain('Bank Donation Total Widget');
          expect(res.text).toContain('Total Bank Donations');
        });
    });

    it('should return JSON data when format=json', async () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      
      // Create test bank transactions
      await bankTransactionModel.create({
        streamerId: streamerId,
        reference: 'REF001',
        description: 'Test donation 1',
        amount: 100000,
        currency: 'VND',
        transactionDate: new Date('2024-01-15T10:30:00.000Z'),
      });

      await bankTransactionModel.create({
        streamerId: streamerId,
        reference: 'REF002',
        description: 'Test donation 2',
        amount: 200000,
        currency: 'VND',
        transactionDate: new Date('2024-01-16T11:30:00.000Z'),
      });

      return request(app.getHttpServer())
        .get(`/api/widget-public/bank-total/${streamerId}?format=json`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.streamerId).toBe(streamerId);
          expect(res.body.data.totalAmount).toBe(300000);
          expect(res.body.data.currency).toBe('VND');
          expect(res.body.data.transactionCount).toBe(2);
        });
    });

    it('should return detailed stats when showStats=true', async () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      
      // Create test bank transactions
      await bankTransactionModel.create({
        streamerId: streamerId,
        reference: 'REF001',
        description: 'Test donation 1',
        amount: 100000,
        currency: 'VND',
        transactionDate: new Date('2024-01-15T10:30:00.000Z'),
      });

      return request(app.getHttpServer())
        .get(`/api/widget-public/bank-total/${streamerId}?format=json&showStats=true`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('averageDonation');
          expect(res.body.data).toHaveProperty('todayDonations');
          expect(res.body.data).toHaveProperty('thisWeekDonations');
          expect(res.body.data).toHaveProperty('thisMonthDonations');
        });
    });

    it('should return zero values when no transactions exist', () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      
      return request(app.getHttpServer())
        .get(`/api/widget-public/bank-total/${streamerId}?format=json`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.totalAmount).toBe(0);
          expect(res.body.data.transactionCount).toBe(0);
        });
    });

    it('should handle different themes', () => {
      const streamerId = '64a1b2c3d4e5f6789abcdef1';
      
      return request(app.getHttpServer())
        .get(`/api/widget-public/bank-total/${streamerId}?theme=light`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect((res) => {
          expect(res.text).toContain('rgba(255, 255, 255, 0.9)'); // Light theme background
        });
    });
  });
});
