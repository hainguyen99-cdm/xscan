# Multi-Currency Support Documentation

This document describes the multi-currency support features implemented in the e-wallet system.

## Overview

The multi-currency support allows users to:
- Create wallets in different currencies
- Convert between currencies using real-time exchange rates
- Transfer funds between wallets with different currencies
- View wallet balances in different currencies
- Access exchange rate information

## Supported Currencies

The system supports the following currencies:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)

## Exchange Rate Service

### Features
- **Real-time exchange rates** from multiple providers
- **Caching system** to reduce API calls (5-minute cache duration)
- **Fallback providers** for reliability
- **Error handling** with graceful degradation

### Exchange Rate Providers
1. **ExchangeRate-API** (Primary - Free tier)
2. **Fixer.io** (Secondary - Requires API key)
3. **CurrencyLayer** (Tertiary - Requires API key)

### Configuration
Add the following environment variables for premium providers:
```env
FIXER_API_KEY=your_fixer_api_key
CURRENCY_LAYER_API_KEY=your_currency_layer_api_key
```

## API Endpoints

### Currency Conversion
```http
POST /wallets/convert-currency
Content-Type: application/json

{
  "amount": 100.50,
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "description": "Optional description"
}
```

### Get Exchange Rates
```http
POST /wallets/exchange-rates
Content-Type: application/json

{
  "baseCurrency": "USD",
  "targetCurrencies": ["EUR", "GBP", "JPY"]
}
```

### Get Supported Currencies
```http
GET /wallets/currencies/supported
```

### Cross-Currency Transfer
```http
POST /wallets/{fromWalletId}/transfer-cross-currency/{toWalletId}
Content-Type: application/json

{
  "amount": 100.00,
  "description": "Optional description"
}
```

### Get Balance in Different Currency
```http
GET /wallets/{walletId}/balance/{currency}
```

### Cache Management
```http
GET /wallets/exchange-rates/cache/stats
DELETE /wallets/exchange-rates/cache
```

## Implementation Details

### Exchange Rate Service (`ExchangeRateService`)

The service provides:
- `getExchangeRate(fromCurrency, toCurrency)` - Get exchange rate between two currencies
- `convertCurrency(amount, fromCurrency, toCurrency)` - Convert amount between currencies
- `getExchangeRates(baseCurrency, targetCurrencies)` - Get rates for multiple currencies
- `getSupportedCurrencies()` - Get list of supported currencies
- `isCurrencySupported(currency)` - Validate currency support
- Cache management methods

### Wallet Service Integration

The wallet service includes:
- `convertCurrency()` - Currency conversion endpoint
- `getExchangeRates()` - Exchange rate queries
- `transferFundsCrossCurrency()` - Cross-currency transfers
- `getWalletBalanceInCurrency()` - Balance in different currencies
- Cache management endpoints

### Database Schema Updates

The existing wallet and transaction schemas support multi-currency:
- Wallet schema includes `currency` field
- Transaction schema includes `currency` field
- Transaction metadata can store conversion information

## Usage Examples

### 1. Convert Currency
```typescript
const conversion = await walletsService.convertCurrency({
  amount: 100,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  description: 'International transfer'
});

// Result:
{
  amount: 85.50,
  rate: 0.855,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  description: 'International transfer',
  timestamp: '2024-01-15T10:30:00Z'
}
```

### 2. Cross-Currency Transfer
```typescript
const result = await walletsService.transferFundsCrossCurrency(
  'wallet1Id',
  'wallet2Id',
  100,
  'International payment'
);

// Result includes:
{
  fromWallet: { balance: 900, currency: 'USD' },
  toWallet: { balance: 85.50, currency: 'EUR' },
  conversion: {
    amount: 85.50,
    rate: 0.855,
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  }
}
```

### 3. Get Balance in Different Currency
```typescript
const balance = await walletsService.getWalletBalanceInCurrency(
  'walletId',
  'EUR'
);

// Result:
{
  balance: 1000,
  currency: 'USD',
  convertedBalance: 855,
  targetCurrency: 'EUR',
  rate: 0.855
}
```

## Error Handling

The system handles various error scenarios:
- **Unsupported currencies** - Returns 400 Bad Request
- **API failures** - Graceful fallback to alternative providers
- **Network timeouts** - 5-second timeout with retry logic
- **Invalid amounts** - Validation with descriptive error messages

## Performance Considerations

### Caching Strategy
- Exchange rates cached for 5 minutes
- Reduces API calls and improves response times
- Cache can be cleared manually if needed

### Rate Limiting
- Respects provider rate limits
- Implements timeout handling
- Fallback providers for reliability

### Database Optimization
- Currency indexes for efficient queries
- Transaction metadata for conversion tracking
- Minimal schema changes for backward compatibility

## Testing

Comprehensive test coverage includes:
- Unit tests for ExchangeRateService
- Integration tests for wallet operations
- Mock external API responses
- Error scenario testing
- Cache behavior validation

## Security Considerations

- Currency validation to prevent injection
- Amount validation and limits
- Secure API key management
- Transaction integrity checks
- Audit trail for conversions

## Future Enhancements

Potential improvements:
- Historical exchange rate tracking
- Currency pair preferences
- Automated currency conversion rules
- Multi-currency fee structures
- Real-time rate notifications
- Currency hedging options 