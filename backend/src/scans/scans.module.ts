import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Scan, ScanSchema } from './schemas/scan.schema';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Scan.name, schema: ScanSchema }]),
    CommonModule,
  ],
  providers: [ScansService],
  controllers: [ScansController],
  exports: [ScansService],
})
export class ScansModule {}
