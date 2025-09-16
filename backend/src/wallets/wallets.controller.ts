import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletsService } from './wallets.service';
import {
  CreateWalletDto,
  AddFundsDto,
  WithdrawFundsDto,
  TransferFundsDto,
  ProcessDonationDto,
  ProcessFeeDto,
  ConvertCurrencyDto,
  GetExchangeRateDto,
} from './dto';
import { PaymentProvider } from '../payments/payments.service';
import { ProcessPaymentDto, RefundPaymentDto } from '../payments/dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}


  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  async createWallet(@Request() req, @Body() createWalletDto: CreateWalletDto) {
    const wallet = await this.walletsService.createWallet(
      req.user.id,
      createWalletDto,
    );
    return {
      success: true,
      data: wallet,
      message: 'Wallet created successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getWallet(@Param('id') id: string) {
    const wallet = await this.walletsService.getWallet(id);
    return {
      success: true,
      data: wallet,
      message: 'Wallet retrieved successfully',
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet by user ID' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getWalletByUserId(
    @Request() req,
    @Param('userId') userId: string,
    @Query('currency') currency?: string,
  ) {
    const wallet = await this.walletsService.getWalletByUserIdForUser(
      userId,
      req.user.id,
      currency,
    );
    return {
      success: true,
      data: wallet,
      message: 'Wallet retrieved successfully',
    };
  }

  @Get(':id/balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getWalletBalance(@Request() req, @Param('id') id: string) {
    const balance = await this.walletsService.getWalletBalance(id, req.user.id);
    return {
      success: true,
      data: balance,
      message: 'Balance retrieved successfully',
    };
  }

  @Post(':id/add-funds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add funds to wallet' })
  @ApiResponse({ status: 200, description: 'Funds added successfully' })
  async addFunds(@Request() req, @Param('id') id: string, @Body() addFundsDto: AddFundsDto) {
    const wallet = await this.walletsService.addFunds(id, addFundsDto, req.user.id);
    return {
      success: true,
      data: wallet,
      message: 'Funds added successfully',
    };
  }

  @Post(':id/withdraw-funds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({ status: 200, description: 'Funds withdrawn successfully' })
  async withdrawFunds(
    @Request() req,
    @Param('id') id: string,
    @Body() withdrawFundsDto: WithdrawFundsDto,
  ) {
    const wallet = await this.walletsService.withdrawFunds(
      id,
      withdrawFundsDto,
      req.user.id,
    );
    return {
      success: true,
      data: wallet,
      message: 'Funds withdrawn successfully',
    };
  }

  @Post(':id/transfer-funds')
  @ApiOperation({ summary: 'Transfer funds between wallets' })
  @ApiResponse({ status: 200, description: 'Funds transferred successfully' })
  async transferFunds(
    @Param('id') id: string,
    @Body() transferFundsDto: TransferFundsDto,
  ) {
    const result = await this.walletsService.transferFunds(
      id,
      transferFundsDto,
    );
    return {
      success: true,
      data: result,
      message: 'Funds transferred successfully',
    };
  }

  @Get(':id/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
  })
  async getTransactionHistory(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const transactions = await this.walletsService.getTransactionHistory(
      id,
      limit || 50,
      offset || 0,
      req.user.id,
    );
    return {
      success: true,
      data: transactions,
      message: 'Transaction history retrieved successfully',
    };
  }

  @Post(':id/donate')
  @ApiOperation({ summary: 'Process donation' })
  @ApiResponse({ status: 200, description: 'Donation processed successfully' })
  async processDonation(
    @Param('id') id: string,
    @Body() processDonationDto: ProcessDonationDto,
  ) {
    const result = await this.walletsService.processDonation(
      id,
      processDonationDto.toUserId,
      processDonationDto.amount,
      processDonationDto.description,
    );
    return {
      success: true,
      data: result,
      message: 'Donation processed successfully',
    };
  }

  @Post(':id/process-fee')
  @ApiOperation({ summary: 'Process fee' })
  @ApiResponse({ status: 200, description: 'Fee processed successfully' })
  async processFee(
    @Param('id') id: string,
    @Body() processFeeDto: ProcessFeeDto,
  ) {
    const result = await this.walletsService.processFee(
      id,
      processFeeDto.amount,
      processFeeDto.description,
      processFeeDto.feeType,
    );
    return {
      success: true,
      data: result,
      message: 'Fee processed successfully',
    };
  }

  @Get('transactions/:transactionId')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  async getTransactionById(@Param('transactionId') transactionId: string) {
    const transaction =
      await this.walletsService.getTransactionById(transactionId);
    return {
      success: true,
      data: transaction,
      message: 'Transaction retrieved successfully',
    };
  }

  @Get(':id/transactions/type/:type')
  @ApiOperation({ summary: 'Get transactions by type' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getTransactionsByType(
    @Param('id') id: string,
    @Param('type') type: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const transactions = await this.walletsService.getTransactionsByType(
      id,
      type,
      limit || 50,
      offset || 0,
    );
    return {
      success: true,
      data: transactions,
      message: 'Transactions retrieved successfully',
    };
  }

  @Get(':id/transaction-stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
  })
  async getTransactionStats(@Param('id') id: string) {
    const stats = await this.walletsService.getTransactionStats(id);
    return {
      success: true,
      data: stats,
      message: 'Transaction statistics retrieved successfully',
    };
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate wallet' })
  @ApiResponse({ status: 200, description: 'Wallet deactivated successfully' })
  async deactivateWallet(@Param('id') id: string) {
    const wallet = await this.walletsService.deactivateWallet(id);
    return {
      success: true,
      data: wallet,
      message: 'Wallet deactivated successfully',
    };
  }

  @Put(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate wallet' })
  @ApiResponse({ status: 200, description: 'Wallet reactivated successfully' })
  async reactivateWallet(@Param('id') id: string) {
    const wallet = await this.walletsService.reactivateWallet(id);
    return {
      success: true,
      data: wallet,
      message: 'Wallet reactivated successfully',
    };
  }

  // Payment Gateway Integration Endpoints
  @Post(':id/payment/process')
  @ApiOperation({ summary: 'Process payment with wallet integration' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    const result = await this.walletsService.processPayment(
      id,
      processPaymentDto,
    );
    return {
      success: true,
      data: result,
      message: 'Payment processed successfully',
    };
  }

  @Post(':id/payment/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    const result = await this.walletsService.refundPayment(
      id,
      refundPaymentDto,
    );
    return {
      success: true,
      data: result,
      message: 'Payment refunded successfully',
    };
  }

  @Post(':id/stripe/payment-intent')
  @ApiOperation({ summary: 'Create Stripe payment intent for wallet' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  async createStripePaymentIntent(
    @Param('id') id: string,
    @Body() body: { amount: number; metadata?: Record<string, any> },
  ) {
    const paymentIntent = await this.walletsService.createPaymentIntent(
      id,
      PaymentProvider.STRIPE,
      body.amount,
      body.metadata,
    );
    return {
      success: true,
      data: paymentIntent,
      message: 'Stripe payment intent created successfully',
    };
  }

  @Post(':id/paypal/payment-intent')
  @ApiOperation({ summary: 'Create PayPal payment intent for wallet' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  async createPayPalPaymentIntent(
    @Param('id') id: string,
    @Body() body: { amount: number; metadata?: Record<string, any> },
  ) {
    const paymentIntent = await this.walletsService.createPaymentIntent(
      id,
      PaymentProvider.PAYPAL,
      body.amount,
      body.metadata,
    );
    return {
      success: true,
      data: paymentIntent,
      message: 'PayPal payment intent created successfully',
    };
  }

  @Post(':id/stripe/confirm')
  @ApiOperation({ summary: 'Confirm Stripe payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmStripePayment(
    @Param('id') id: string,
    @Body() body: { paymentIntentId: string },
  ) {
    const result = await this.walletsService.confirmPayment(
      id,
      PaymentProvider.STRIPE,
      body.paymentIntentId,
    );
    return {
      success: true,
      data: result,
      message: 'Stripe payment confirmed successfully',
    };
  }

  @Post(':id/paypal/confirm')
  @ApiOperation({ summary: 'Confirm PayPal payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayPalPayment(
    @Param('id') id: string,
    @Body() body: { paymentIntentId: string },
  ) {
    const result = await this.walletsService.confirmPayment(
      id,
      PaymentProvider.PAYPAL,
      body.paymentIntentId,
    );
    return {
      success: true,
      data: result,
      message: 'PayPal payment confirmed successfully',
    };
  }

  @Post(':id/stripe/withdraw')
  @ApiOperation({ summary: 'Withdraw funds via Stripe' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal initiated successfully',
  })
  async withdrawViaStripe(
    @Param('id') id: string,
    @Body() body: { amount: number; destination: string; description?: string },
  ) {
    const result = await this.walletsService.withdrawViaPaymentProvider(
      id,
      PaymentProvider.STRIPE,
      body.amount,
      body.destination,
      body.description,
    );
    return {
      success: true,
      data: result,
      message: 'Stripe withdrawal initiated successfully',
    };
  }

  @Post(':id/paypal/withdraw')
  @ApiOperation({ summary: 'Withdraw funds via PayPal' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal initiated successfully',
  })
  async withdrawViaPayPal(
    @Param('id') id: string,
    @Body() body: { amount: number; destination: string; description?: string },
  ) {
    const result = await this.walletsService.withdrawViaPaymentProvider(
      id,
      PaymentProvider.PAYPAL,
      body.amount,
      body.destination,
      body.description,
    );
    return {
      success: true,
      data: result,
      message: 'PayPal withdrawal initiated successfully',
    };
  }

  @Get('currencies/:provider')
  @ApiOperation({ summary: 'Get supported currencies for payment provider' })
  @ApiResponse({
    status: 200,
    description: 'Supported currencies retrieved successfully',
  })
  async getSupportedCurrencies(@Param('provider') provider: string) {
    const currencies =
      await this.walletsService.getSupportedCurrencies(provider);
    return {
      success: true,
      data: currencies,
      message: 'Supported currencies retrieved successfully',
    };
  }

  @Get('fees/:provider/estimate')
  @ApiOperation({ summary: 'Get fee estimate for payment provider' })
  @ApiResponse({
    status: 200,
    description: 'Fee estimate retrieved successfully',
  })
  async getFeeEstimate(
    @Param('provider') provider: string,
    @Query('amount') amount: number,
    @Query('currency') currency: string,
  ) {
    const feeEstimate = await this.walletsService.getFeeEstimate(
      provider,
      amount,
      currency,
    );
    return {
      success: true,
      data: feeEstimate,
      message: 'Fee estimate retrieved successfully',
    };
  }

  @Get('payment-provider/recommended')
  @ApiOperation({ summary: 'Get recommended payment provider' })
  @ApiResponse({
    status: 200,
    description: 'Recommended provider retrieved successfully',
  })
  async getRecommendedPaymentProvider(
    @Query('amount') amount: number,
    @Query('currency') currency: string,
  ) {
    const provider = await this.walletsService.getRecommendedPaymentProvider(
      amount,
      currency,
    );
    return {
      success: true,
      data: provider,
      message: 'Recommended payment provider retrieved successfully',
    };
  }

  // Multi-Currency Support Endpoints

  @Post('convert-currency')
  @ApiOperation({ summary: 'Convert currency between different currencies' })
  @ApiResponse({ status: 200, description: 'Currency converted successfully' })
  async convertCurrency(@Body() convertCurrencyDto: ConvertCurrencyDto) {
    const result =
      await this.walletsService.convertCurrency(convertCurrencyDto);
    return {
      success: true,
      data: result,
      message: 'Currency converted successfully',
    };
  }

  @Post('exchange-rates')
  @ApiOperation({ summary: 'Get exchange rates for specified currencies' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
  })
  async getExchangeRates(@Body() getExchangeRateDto: GetExchangeRateDto) {
    const rates =
      await this.walletsService.getExchangeRates(getExchangeRateDto);
    return {
      success: true,
      data: rates,
      message: 'Exchange rates retrieved successfully',
    };
  }

  @Get('currencies/supported')
  @ApiOperation({ summary: 'Get all supported currencies' })
  @ApiResponse({
    status: 200,
    description: 'Supported currencies retrieved successfully',
  })
  async getSupportedCurrenciesList() {
    const currencies = this.walletsService.getSupportedCurrenciesList();
    return {
      success: true,
      data: currencies,
      message: 'Supported currencies retrieved successfully',
    };
  }

  @Post(':id/transfer-cross-currency/:toWalletId')
  @ApiOperation({
    summary: 'Transfer funds between wallets with different currencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Cross-currency transfer completed successfully',
  })
  async transferFundsCrossCurrency(
    @Param('id') fromWalletId: string,
    @Param('toWalletId') toWalletId: string,
    @Body() body: { amount: number; description?: string },
  ) {
    const result = await this.walletsService.transferFundsCrossCurrency(
      fromWalletId,
      toWalletId,
      body.amount,
      body.description,
    );
    return {
      success: true,
      data: result,
      message: 'Cross-currency transfer completed successfully',
    };
  }

  @Get(':id/balance/:currency')
  @ApiOperation({ summary: 'Get wallet balance in different currency' })
  @ApiResponse({
    status: 200,
    description: 'Balance in target currency retrieved successfully',
  })
  async getWalletBalanceInCurrency(
    @Param('id') walletId: string,
    @Param('currency') targetCurrency: string,
  ) {
    const balance = await this.walletsService.getWalletBalanceInCurrency(
      walletId,
      targetCurrency,
    );
    return {
      success: true,
      data: balance,
      message: 'Balance in target currency retrieved successfully',
    };
  }

  @Get('exchange-rates/cache/stats')
  @ApiOperation({ summary: 'Get exchange rate cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  async getExchangeRateCacheStats() {
    const stats = this.walletsService.getExchangeRateCacheStats();
    return {
      success: true,
      data: stats,
      message: 'Cache statistics retrieved successfully',
    };
  }

  @Delete('exchange-rates/cache')
  @ApiOperation({ summary: 'Clear exchange rate cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearExchangeRateCache() {
    this.walletsService.clearExchangeRateCache();
    return {
      success: true,
      message: 'Exchange rate cache cleared successfully',
    };
  }
}
