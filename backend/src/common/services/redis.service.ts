import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connectRedis();
  }

  async onModuleDestroy() {
    await this.disconnectRedis();
  }

  private async connectRedis(): Promise<void> {
    try {
      const redisConfig = this.configService.get('database.redis');
      
      this.redisClient = new Redis(redisConfig);

      this.redisClient.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.redisClient.on('close', () => {
        this.logger.warn('Redis connection closed');
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.log('Reconnecting to Redis...');
      });

      // Test connection
      await this.redisClient.ping();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  private async disconnectRedis(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.setex(key, ttl, value);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      throw error;
    }
  }

  async setObject(key: string, value: object, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, ttl);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const jsonValue = await this.get(key);
    if (!jsonValue) return null;
    
    try {
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redisClient.flushall();
      this.logger.log('Redis cache cleared');
    } catch (error) {
      this.logger.error('Failed to flush Redis cache:', error);
      throw error;
    }
  }
} 