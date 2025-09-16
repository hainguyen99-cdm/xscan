import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { PaypalService } from './paypal.service';
import { PaymentsController } from './payments.controller';
import { TransactionManagementService } from './transaction-management.service';
import { AdminTransactionManagementController } from './admin-transaction-management.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { ConfigModule } from '../config/config.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [
    PaymentsService, 
    StripeService, 
    PaypalService,
    TransactionManagementService,
  ],
  controllers: [
    PaymentsController,
    AdminTransactionManagementController,
  ],
  exports: [
    PaymentsService, 
    StripeService, 
    PaypalService,
    TransactionManagementService,
  ],
})
export class PaymentsModule {}
