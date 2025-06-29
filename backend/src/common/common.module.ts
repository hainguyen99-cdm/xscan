import { Module } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { HealthController } from './controllers/health.controller';

@Module({
  providers: [DatabaseService, RedisService],
  controllers: [HealthController],
  exports: [DatabaseService, RedisService],
})
export class CommonModule {}
