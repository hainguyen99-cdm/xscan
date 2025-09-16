import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankSyncService } from './bank-sync.service';
import { BankTransaction, BankTransactionSchema } from './schemas/bank-transaction.schema';
import { UsersModule } from '../users/users.module';
import { OBSSettingsModule } from '../obs-settings/obs-settings.module';
import { ConfigModule } from '../config/config.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: BankTransaction.name, schema: BankTransactionSchema },
		]),
		forwardRef(() => UsersModule),
		forwardRef(() => OBSSettingsModule),
		ConfigModule,
	],
	providers: [BankSyncService],
	exports: [BankSyncService],
})
export class BankSyncModule {}


