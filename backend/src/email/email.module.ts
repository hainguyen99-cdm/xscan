import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { CommonModule } from '../common/common.module';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
