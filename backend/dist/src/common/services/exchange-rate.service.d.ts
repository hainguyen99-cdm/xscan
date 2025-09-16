import { ConfigService } from '../../config/config.service';
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
export declare class ExchangeRateService {
    private readonly configService;
    private readonly logger;
    private readonly cache;
    private readonly CACHE_DURATION;
    constructor(configService: ConfigService);
    getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number>;
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<{
        amount: number;
        rate: number;
        fromCurrency: string;
        toCurrency: string;
    }>;
    getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]>;
    getSupportedCurrencies(): CurrencyInfo[];
    isCurrencySupported(currency: string): boolean;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        entries: string[];
    };
    private fetchExchangeRate;
    private fetchFromExchangeRateAPI;
    private fetchFromFixerIO;
    private fetchFromCurrencyLayer;
}
