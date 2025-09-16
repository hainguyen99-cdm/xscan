import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Clear all keys by iterating through them
    // Note: This is a simplified implementation
    // In a real Redis implementation, you might want to use FLUSHDB
    console.log(
      'Cache reset requested - implementation depends on Redis client',
    );
  }

  async getTtl(key: string): Promise<number> {
    // Note: TTL functionality depends on the specific Redis client implementation
    // This is a placeholder implementation
    console.log('TTL check requested for key:', key);
    return -1; // -1 indicates no TTL set
  }

  /**
   * Get TTL for a key (alias for getTtl for compatibility)
   */
  async ttl(key: string): Promise<number> {
    return this.getTtl(key);
  }

  /**
   * Set key with expiration (alias for set with ttl for compatibility)
   */
  async setex(key: string, ttl: number, value: any): Promise<void> {
    await this.set(key, value, ttl);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Publish message to a channel (for WebSocket notifications)
   * Note: This is a simplified implementation using cache manager
   * In production, you might want to use a proper Redis pub/sub client
   */
  async publish(channel: string, message: string): Promise<void> {
    try {
      // Store the message in cache with a short TTL for immediate delivery
      const messageKey = `${channel}:${Date.now()}`;
      await this.set(messageKey, message, 60); // 60 seconds TTL
      
      // Log the published message for debugging
      console.log(`Published message to channel ${channel}:`, message);
    } catch (error) {
      console.error(`Failed to publish message to channel ${channel}:`, error);
    }
  }

  /**
   * Subscribe to a channel (for WebSocket notifications)
   * Note: This is a simplified implementation using cache manager
   * In production, you might want to use a proper Redis pub/sub client
   */
  async subscribe(channel: string): Promise<string[]> {
    try {
      // Get all messages for the channel
      const keys = await this.getChannelKeys(channel);
      const messages: string[] = [];
      
      for (const key of keys) {
        const message = await this.get<string>(key);
        if (message) {
          messages.push(message);
          // Remove the message after reading
          await this.del(key);
        }
      }
      
      return messages;
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channel}:`, error);
      return [];
    }
  }

  /**
   * Get all keys for a specific channel
   */
  private async getChannelKeys(channel: string): Promise<string[]> {
    // This is a simplified implementation
    // In a real Redis implementation, you would use SCAN or KEYS
    try {
      // For now, we'll return an empty array as this is a placeholder
      // In production, implement proper Redis key scanning
      return [];
    } catch (error) {
      console.error(`Failed to get channel keys for ${channel}:`, error);
      return [];
    }
  }
}
