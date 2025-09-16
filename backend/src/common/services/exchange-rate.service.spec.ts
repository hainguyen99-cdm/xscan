import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateService } from './exchange-rate.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearCache();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeRate', () => {
    it('should return 1 for same currency conversion', async () => {
      const rate = await service.getExchangeRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    it('should fetch exchange rate from external API', async () => {
      const mockResponse = {
        data: {
          rates: {
            EUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const rate = await service.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 5000 },
      );
    });

    it('should use cached rate if available and not expired', async () => {
      const mockResponse = {
        data: {
          rates: {
            EUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // First call - fetch from API
      const rate1 = await service.getExchangeRate('USD', 'EUR');
      expect(rate1).toBe(0.85);

      // Second call - should use cache
      const rate2 = await service.getExchangeRate('USD', 'EUR');
      expect(rate2).toBe(0.85);

      // Should only call API once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getExchangeRate('USD', 'EUR')).rejects.toThrow(
        'Unable to get exchange rate for USD to EUR',
      );
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency correctly', async () => {
      const mockResponse = {
        data: {
          rates: {
            EUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.convertCurrency(100, 'USD', 'EUR');
      expect(result).toEqual({
        amount: 85,
        rate: 0.85,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      });
    });

    it('should round to 2 decimal places', async () => {
      const mockResponse = {
        data: {
          rates: {
            EUR: 0.856789,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.convertCurrency(100, 'USD', 'EUR');
      expect(result.amount).toBe(85.68);
    });
  });

  describe('getExchangeRates', () => {
    it('should return rates for multiple currencies', async () => {
      const mockResponse = {
        data: {
          rates: {
            EUR: 0.85,
            GBP: 0.73,
          },
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const rates = await service.getExchangeRates('USD', ['EUR', 'GBP']);
      expect(rates).toHaveLength(2);
      expect(rates[0]).toMatchObject({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        source: 'external',
      });
      expect(rates[1]).toMatchObject({
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        rate: 0.73,
        source: 'external',
      });
    });

    it('should return rate of 1 for same currency', async () => {
      const rates = await service.getExchangeRates('USD', ['USD']);
      expect(rates).toHaveLength(1);
      expect(rates[0]).toMatchObject({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        rate: 1,
        source: 'internal',
      });
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', () => {
      const currencies = service.getSupportedCurrencies();
      expect(currencies).toHaveLength(8);
      expect(currencies).toEqual(
        expect.arrayContaining([
          { code: 'USD', name: 'US Dollar', symbol: '$', isActive: true },
          { code: 'EUR', name: 'Euro', symbol: '€', isActive: true },
          { code: 'GBP', name: 'British Pound', symbol: '£', isActive: true },
        ]),
      );
    });
  });

  describe('isCurrencySupported', () => {
    it('should return true for supported currencies', () => {
      expect(service.isCurrencySupported('USD')).toBe(true);
      expect(service.isCurrencySupported('EUR')).toBe(true);
      expect(service.isCurrencySupported('usd')).toBe(true); // Case insensitive
    });

    it('should return false for unsupported currencies', () => {
      expect(service.isCurrencySupported('XYZ')).toBe(false);
      expect(service.isCurrencySupported('BTC')).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      const stats = service.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe('external API providers', () => {
    it('should try multiple providers when one fails', async () => {
      // First provider fails
      mockedAxios.get.mockRejectedValueOnce(
        new Error('ExchangeRate-API failed'),
      );

      // Second provider succeeds
      const mockResponse = {
        data: {
          success: true,
          rates: {
            EUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Mock config service to return API key
      jest.spyOn(configService, 'get').mockReturnValue('test-api-key');

      const rate = await service.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle Fixer.io API when primary fails', async () => {
      // Mock config service to return API key
      jest.spyOn(configService, 'get').mockReturnValue('test-api-key');

      // First provider fails
      mockedAxios.get.mockRejectedValueOnce(
        new Error('ExchangeRate-API failed'),
      );

      // Fixer.io succeeds
      const mockResponse = {
        data: {
          success: true,
          rates: {
            EUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const rate = await service.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);

      // Check that Fixer.io was called
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://data.fixer.io/api/latest?access_key=test-api-key&base=USD&symbols=EUR',
        { timeout: 5000 },
      );
    });

    it('should handle CurrencyLayer API when other providers fail', async () => {
      // Mock config service to return API key
      jest.spyOn(configService, 'get').mockReturnValue('test-api-key');

      // First two providers fail
      mockedAxios.get.mockRejectedValueOnce(
        new Error('ExchangeRate-API failed'),
      );
      mockedAxios.get.mockRejectedValueOnce(new Error('Fixer.io failed'));

      // CurrencyLayer succeeds
      const mockResponse = {
        data: {
          success: true,
          quotes: {
            USDEUR: 0.85,
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const rate = await service.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);

      // Check that CurrencyLayer was called
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://api.currencylayer.com/live?access_key=test-api-key&currencies=EUR&source=USD',
        { timeout: 5000 },
      );
    });
  });
});
