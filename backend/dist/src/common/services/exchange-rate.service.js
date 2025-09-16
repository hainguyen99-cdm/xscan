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
var ExchangeRateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const axios_1 = require("axios");
let ExchangeRateService = ExchangeRateService_1 = class ExchangeRateService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExchangeRateService_1.name);
        this.cache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000;
    }
    async getExchangeRate(fromCurrency, toCurrency) {
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();
        if (from === to) {
            return 1;
        }
        const cacheKey = `${from}_${to}`;
        const cached = this.cache.get(cacheKey);
        if (cached &&
            Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
            this.logger.debug(`Using cached exchange rate for ${from} to ${to}: ${cached.rate}`);
            return cached.rate;
        }
        try {
            const rate = await this.fetchExchangeRate(from, to);
            this.cache.set(cacheKey, {
                rate,
                timestamp: new Date(),
            });
            this.logger.log(`Fetched exchange rate for ${from} to ${to}: ${rate}`);
            return rate;
        }
        catch (error) {
            this.logger.error(`Failed to fetch exchange rate for ${from} to ${to}:`, error);
            throw new common_1.HttpException(`Unable to get exchange rate for ${from} to ${to}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        const convertedAmount = amount * rate;
        return {
            amount: Math.round(convertedAmount * 100) / 100,
            rate,
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
        };
    }
    async getExchangeRates(baseCurrency, targetCurrencies) {
        const base = baseCurrency.toUpperCase();
        const rates = [];
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
            }
            catch (error) {
                this.logger.warn(`Failed to get rate for ${base} to ${targetUpper}:`, error);
            }
        }
        return rates;
    }
    getSupportedCurrencies() {
        return [
            { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', isActive: true },
        ];
    }
    isCurrencySupported(currency) {
        const supportedCurrencies = this.getSupportedCurrencies();
        return supportedCurrencies.some((c) => c.code === currency.toUpperCase());
    }
    clearCache() {
        this.cache.clear();
        this.logger.log('Exchange rate cache cleared');
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    }
    async fetchExchangeRate(fromCurrency, toCurrency) {
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
            }
            catch (error) {
                this.logger.warn(`Provider failed, trying next:`, error.message);
                continue;
            }
        }
        throw new Error('All exchange rate providers failed');
    }
    async fetchFromExchangeRateAPI(fromCurrency, toCurrency) {
        try {
            const response = await axios_1.default.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`, { timeout: 5000 });
            if (response.data &&
                response.data.rates &&
                response.data.rates[toCurrency]) {
                return response.data.rates[toCurrency];
            }
            throw new Error('Invalid response format');
        }
        catch (error) {
            this.logger.warn(`ExchangeRate-API failed: ${error.message}`);
            throw error;
        }
    }
    async fetchFromFixerIO(fromCurrency, toCurrency) {
        const apiKey = this.configService.fixerApiKey;
        if (!apiKey) {
            throw new Error('Fixer.io API key not configured');
        }
        try {
            const response = await axios_1.default.get(`http://data.fixer.io/api/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`, { timeout: 5000 });
            if (response.data &&
                response.data.success &&
                response.data.rates &&
                response.data.rates[toCurrency]) {
                return response.data.rates[toCurrency];
            }
            throw new Error('Invalid response format');
        }
        catch (error) {
            this.logger.warn(`Fixer.io failed: ${error.message}`);
            throw error;
        }
    }
    async fetchFromCurrencyLayer(fromCurrency, toCurrency) {
        const apiKey = this.configService.currencyLayerApiKey;
        if (!apiKey) {
            throw new Error('CurrencyLayer API key not configured');
        }
        try {
            const response = await axios_1.default.get(`http://api.currencylayer.com/live?access_key=${apiKey}&currencies=${toCurrency}&source=${fromCurrency}`, { timeout: 5000 });
            if (response.data && response.data.success && response.data.quotes) {
                const quoteKey = `${fromCurrency}${toCurrency}`;
                if (response.data.quotes[quoteKey]) {
                    return response.data.quotes[quoteKey];
                }
            }
            throw new Error('Invalid response format');
        }
        catch (error) {
            this.logger.warn(`CurrencyLayer failed: ${error.message}`);
            throw error;
        }
    }
};
exports.ExchangeRateService = ExchangeRateService;
exports.ExchangeRateService = ExchangeRateService = ExchangeRateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ExchangeRateService);
//# sourceMappingURL=exchange-rate.service.js.map