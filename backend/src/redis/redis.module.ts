import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '../config/config.module';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      store: 'redis',
      host: 'localhost',
      port: 6379,
      db: 0,
      ttl: 60 * 60 * 24, // 24 hours default TTL
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
