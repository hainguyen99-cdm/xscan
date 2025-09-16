import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import axios from 'axios';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly cache = new Map<string, { rate: number; timestamp: Date }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    // Normalize currency codes
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    // Same currency conversion
    if (from === to) {
      return 1;
    }

    // Check cache first
    const cacheKey = `${from}_${to}`;
    const cached = this.cache.get(cacheKey);

    if (
      cached &&
      Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION
    ) {
      this.logger.debug(
        `Using cached exchange rate for ${from} to ${to}: ${cached.rate}`,
      );
      return cached.rate;
    }

    try {
      // Try multiple exchange rate providers
      const rate = await this.fetchExchangeRate(from, to);

      // Cache the result
      this.cache.set(cacheKey, {
        rate,
        timestamp: new Date(),
      });

      this.logger.log(`Fetched exchange rate for ${from} to ${to}: ${rate}`);
      return rate;
    } catch (error) {
      this.logger.error(
        `Failed to fetch exchange rate for ${from} to ${to}:`,
        error,
      );
      throw new HttpException(
        `Unable to get exchange rate for ${from} to ${to}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{
    amount: number;
    rate: number;
    fromCurrency: string;
    toCurrency: string;
  }> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    return {
      amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      rate,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
    };
  }

  /**
   * Get exchange rates for multiple currency pairs
   */
  async getExchangeRates(
    baseCurrency: string,
    targetCurrencies: string[],
  ): Promise<ExchangeRate[]> {
    const base = baseCurrency.toUpperCase();
    const rates: ExchangeRate[] = [];

    for (const target of targetCurrencies) {
      const targetUpper = target.toUpperCase();
      if (base === targetUpper) {
        rates.push({
          fromCurrency: base,
          toCurrency: targetUpper,
          rate: 1,
          timestamp: new Date(),
          source: 'internal',
        });
        continue;
      }

      try {
        const rate = await this.getExchangeRate(base, targetUpper);
        rates.push({
          fromCurrency: base,
          toCurrency: targetUpper,
          rate,
          timestamp: new Date(),
          source: 'external',
        });
      } catch (error) {
        this.logger.warn(
          `Failed to get rate for ${base} to ${targetUpper}:`,
          error,
        );
      }
    }

    return rates;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): CurrencyInfo[] {
    return [
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', isActive: true },
    ];
  }

  /**
   * Validate if a currency is supported
   */
  isCurrencySupported(currency: string): boolean {
    const supportedCurrencies = this.getSupportedCurrencies();
    return supportedCurrencies.some((c) => c.code === currency.toUpperCase());
  }

  /**
   * Clear exchange rate cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Exchange rate cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    // Try multiple providers in order of preference
    const providers = [
      () => this.fetchFromExchangeRateAPI(fromCurrency, toCurrency),
      () => this.fetchFromFixerIO(fromCurrency, toCurrency),
      () => this.fetchFromCurrencyLayer(fromCurrency, toCurrency),
    ];

    for (const provider of providers) {
      try {
        const rate = await provider();
        if (rate && rate > 0) {
          return rate;
        }
      } catch (error) {
        this.logger.warn(`Provider failed, trying next:`, error.message);
        continue;
      }
    }

    throw new Error('All exchange rate providers failed');
  }

  /**
   * Fetch from ExchangeRate-API (free tier)
   */
  private async fetchFromExchangeRateAPI(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        { timeout: 5000 },
      );

      if (
        response.data &&
        response.data.rates &&
        response.data.rates[toCurrency]
      ) {
        return response.data.rates[toCurrency];
      }
      throw new Error('Invalid response format');
    } catch (error) {
      this.logger.warn(`ExchangeRate-API failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch from Fixer.io (requires API key)
   */
  private async fetchFromFixerIO(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const apiKey = this.configService.fixerApiKey;
    if (!apiKey) {
      throw new Error('Fixer.io API key not configured');
    }

    try {
      const response = await axios.get(
        `http://data.fixer.io/api/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`,
        { timeout: 5000 },
      );

      if (
        response.data &&
        response.data.success &&
        response.data.rates &&
        response.data.rates[toCurrency]
      ) {
        return response.data.rates[toCurrency];
      }
      throw new Error('Invalid response format');
    } catch (error) {
      this.logger.warn(`Fixer.io failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch from CurrencyLayer (requires API key)
   */
  private async fetchFromCurrencyLayer(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const apiKey = this.configService.currencyLayerApiKey;
    if (!apiKey) {
      throw new Error('CurrencyLayer API key not configured');
    }

    try {
      const response = await axios.get(
        `http://api.currencylayer.com/live?access_key=${apiKey}&currencies=${toCurrency}&source=${fromCurrency}`,
        { timeout: 5000 },
      );

      if (response.data && response.data.success && response.data.quotes) {
        const quoteKey = `${fromCurrency}${toCurrency}`;
        if (response.data.quotes[quoteKey]) {
          return response.data.quotes[quoteKey];
        }
      }
      throw new Error('Invalid response format');
    } catch (error) {
      this.logger.warn(`CurrencyLayer failed: ${error.message}`);
      throw error;
    }
  }
}
