import { Test, TestingModule } from '@nestjs/testing';
import { BankSyncService } from '../src/bank-sync/bank-sync.service';
import { OBSWidgetGateway } from '../src/obs-settings/obs-widget.gateway';
import { BankDonationTotalService } from '../src/obs-settings/bank-donation-total.service';
import { OBSSettingsService } from '../src/obs-settings/obs-settings.service';
import { UsersService } from '../src/users/users.service';
import { ConfigService } from '../src/config/config.service';
import { getModelToken } from '@nestjs/mongoose';

describe('Alert Queue Implementation', () => {
  let service: BankSyncService;
  let gateway: OBSWidgetGateway;
  let mockBankTxModel: any;
  let mockUsersService: any;
  let mockGateway: any;
  let mockBankDonationTotalService: any;
  let mockObsSettingsService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockBankTxModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockUsersService = {
      findUsersWithBankToken: jest.fn(),
    };

    mockGateway = {
      sendDonationAlertWithId: jest.fn(),
      server: {
        on: jest.fn(),
        emit: jest.fn(),
      },
    };

    mockBankDonationTotalService = {
      handleNewBankDonation: jest.fn(),
    };

    mockObsSettingsService = {
      findByStreamerId: jest.fn(),
    };

    mockConfigService = {
      bankRequestTimeoutMs: 5000,
      bankMaxRetries: 3,
      bankRetryDelayMs: 1000,
      darkVcbCode: 'test-code',
      darkVcbEndpoint: 'http://test-endpoint',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankSyncService,
        {
          provide: getModelToken('BankTransaction'),
          useValue: mockBankTxModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: OBSWidgetGateway,
          useValue: mockGateway,
        },
        {
          provide: BankDonationTotalService,
          useValue: mockBankDonationTotalService,
        },
        {
          provide: OBSSettingsService,
          useValue: mockObsSettingsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BankSyncService>(BankSyncService);
    gateway = module.get<OBSWidgetGateway>(OBSWidgetGateway);
  });

  describe('Alert Queue System', () => {
    it('should enqueue donations with unique alert IDs', () => {
      const streamerId = 'test-streamer';
      const alert = {
        streamerId,
        donorName: 'Test Donor',
        amount: 50000,
        currency: 'VND',
        message: 'Test message',
        reference: 'test-ref-1',
      };

      // Mock the private method by accessing it through the service instance
      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamerId, alert);

      // Verify alert was queued with alertId
      const alertQueues = (service as any).alertQueues;
      const state = alertQueues.get(streamerId);
      
      expect(state).toBeDefined();
      expect(state.queue.length).toBe(1);
      expect(state.queue[0].alertId).toBeDefined();
      expect(state.queue[0].timestamp).toBeDefined();
    });

    it('should process queue sequentially with acknowledgment', async () => {
      const streamerId = 'test-streamer';
      
      // Mock OBS settings
      mockObsSettingsService.findByStreamerId.mockResolvedValue({
        displaySettings: { duration: 3000 }
      });

      // Add alerts to queue
      const alert1 = {
        streamerId,
        donorName: 'Donor 1',
        amount: 25000,
        currency: 'VND',
        message: 'First donation',
        reference: 'ref-1',
        alertId: 'alert-1',
        timestamp: new Date(),
      };

      const alert2 = {
        streamerId,
        donorName: 'Donor 2',
        amount: 50000,
        currency: 'VND',
        message: 'Second donation',
        reference: 'ref-2',
        alertId: 'alert-2',
        timestamp: new Date(),
      };

      // Enqueue alerts
      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamerId, alert1);
      enqueueDonation(streamerId, alert2);

      // Start processing
      const processQueue = (service as any).processQueue.bind(service);
      const processPromise = processQueue(streamerId);

      // Simulate acknowledgment for first alert
      setTimeout(() => {
        service.handleAlertCompleted(streamerId, 'alert-1');
      }, 100);

      // Simulate acknowledgment for second alert
      setTimeout(() => {
        service.handleAlertCompleted(streamerId, 'alert-2');
      }, 200);

      await processPromise;

      // Verify both alerts were sent
      expect(mockGateway.sendDonationAlertWithId).toHaveBeenCalledTimes(2);
      expect(mockGateway.sendDonationAlertWithId).toHaveBeenCalledWith(
        streamerId, 'Donor 1', 25000, 'VND', 'First donation', 'alert-1'
      );
      expect(mockGateway.sendDonationAlertWithId).toHaveBeenCalledWith(
        streamerId, 'Donor 2', 50000, 'VND', 'Second donation', 'alert-2'
      );
    });

    it('should handle timeout fallback when acknowledgment is not received', async () => {
      const streamerId = 'test-streamer';
      
      // Mock OBS settings with short duration
      mockObsSettingsService.findByStreamerId.mockResolvedValue({
        displaySettings: { duration: 100 }
      });

      const alert = {
        streamerId,
        donorName: 'Timeout Donor',
        amount: 30000,
        currency: 'VND',
        message: 'Timeout test',
        reference: 'timeout-ref',
        alertId: 'timeout-alert',
        timestamp: new Date(),
      };

      // Enqueue alert
      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamerId, alert);

      // Start processing (don't send acknowledgment)
      const processQueue = (service as any).processQueue.bind(service);
      const processPromise = processQueue(streamerId);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify alert was sent despite no acknowledgment
      expect(mockGateway.sendDonationAlertWithId).toHaveBeenCalledWith(
        streamerId, 'Timeout Donor', 30000, 'VND', 'Timeout test', 'timeout-alert'
      );
    });

    it('should prevent duplicate alerts with same reference', () => {
      const streamerId = 'test-streamer';
      const alert = {
        streamerId,
        donorName: 'Duplicate Donor',
        amount: 40000,
        currency: 'VND',
        message: 'Duplicate test',
        reference: 'duplicate-ref',
      };

      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      
      // Enqueue same alert twice
      enqueueDonation(streamerId, alert);
      enqueueDonation(streamerId, alert);

      // Verify only one alert was queued
      const alertQueues = (service as any).alertQueues;
      const state = alertQueues.get(streamerId);
      expect(state.queue.length).toBe(1);
    });

    it('should handle multiple streamers independently', () => {
      const streamer1 = 'streamer-1';
      const streamer2 = 'streamer-2';

      const alert1 = {
        streamerId: streamer1,
        donorName: 'Donor 1',
        amount: 10000,
        currency: 'VND',
        message: 'Streamer 1 donation',
        reference: 'ref-1',
      };

      const alert2 = {
        streamerId: streamer2,
        donorName: 'Donor 2',
        amount: 20000,
        currency: 'VND',
        message: 'Streamer 2 donation',
        reference: 'ref-2',
      };

      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamer1, alert1);
      enqueueDonation(streamer2, alert2);

      // Verify separate queues
      const alertQueues = (service as any).alertQueues;
      const state1 = alertQueues.get(streamer1);
      const state2 = alertQueues.get(streamer2);

      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
      expect(state1.queue.length).toBe(1);
      expect(state2.queue.length).toBe(1);
      expect(state1.queue[0].streamerId).toBe(streamer1);
      expect(state2.queue[0].streamerId).toBe(streamer2);
    });
  });

  describe('OBSWidgetGateway Integration', () => {
    it('should emit alertCompleted event when received from frontend', () => {
      const mockData = { alertId: 'test-alert', streamerId: 'test-streamer' };
      
      // Simulate frontend sending alertCompleted
      const handleAlertCompleted = (gateway as any).handleAlertCompleted.bind(gateway);
      handleAlertCompleted({ emit: jest.fn() }, mockData);

      // Verify event was emitted
      expect(mockGateway.server.emit).toHaveBeenCalledWith('alertCompleted', mockData);
    });

    it('should send donation alert with unique ID', async () => {
      const streamerId = 'test-streamer';
      const donorName = 'Test Donor';
      const amount = 50000;
      const currency = 'VND';
      const message = 'Test message';
      const alertId = 'unique-alert-id';

      // Mock OBS settings
      mockObsSettingsService.findByStreamerId.mockResolvedValue({
        displaySettings: { duration: 3000 }
      });

      await gateway.sendDonationAlertWithId(
        streamerId, donorName, amount, currency, message, alertId
      );

      // Verify alert was sent with correct data
      expect(mockGateway.server.to).toHaveBeenCalledWith(`streamer:${streamerId}`);
      expect(mockGateway.server.emit).toHaveBeenCalledWith('donationAlert', expect.objectContaining({
        alertId,
        streamerId,
        donorName,
        amount: `${amount} ${currency}`,
        message,
      }));
    });
  });

  describe('Error Handling', () => {
    it('should handle OBS settings errors gracefully', async () => {
      const streamerId = 'test-streamer';
      
      // Mock OBS settings error
      mockObsSettingsService.findByStreamerId.mockRejectedValue(new Error('Settings error'));

      const alert = {
        streamerId,
        donorName: 'Error Donor',
        amount: 15000,
        currency: 'VND',
        message: 'Error test',
        reference: 'error-ref',
        alertId: 'error-alert',
        timestamp: new Date(),
      };

      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamerId, alert);

      // Should not throw error
      const processQueue = (service as any).processQueue.bind(service);
      await expect(processQueue(streamerId)).resolves.not.toThrow();

      // Should still send alert with default settings
      expect(mockGateway.sendDonationAlertWithId).toHaveBeenCalled();
    });

    it('should handle WebSocket connection errors', () => {
      const streamerId = 'test-streamer';
      const alert = {
        streamerId,
        donorName: 'WS Error Donor',
        amount: 25000,
        currency: 'VND',
        message: 'WS error test',
        reference: 'ws-error-ref',
      };

      // Mock WebSocket error
      mockGateway.sendDonationAlertWithId.mockImplementation(() => {
        throw new Error('WebSocket error');
      });

      const enqueueDonation = (service as any).enqueueDonation.bind(service);
      enqueueDonation(streamerId, alert);

      // Should handle error gracefully
      const processQueue = (service as any).processQueue.bind(service);
      expect(processQueue(streamerId)).rejects.toThrow('WebSocket error');
    });
  });
});
