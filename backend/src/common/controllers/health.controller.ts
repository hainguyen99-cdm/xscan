import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../services/database.service';
import { RedisService } from '../services/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get overall health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth() {
    const mongoConnected = await this.databaseService.isConnected();
    const mongoPing = await this.databaseService.ping();
    
    let redisConnected = false;
    try {
      await this.redisService.getClient().ping();
      redisConnected = true;
    } catch (error) {
      redisConnected = false;
    }

    const overallHealth = mongoConnected && mongoPing && redisConnected;

    return {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          connected: mongoConnected,
          ping: mongoPing,
          status: mongoConnected && mongoPing ? 'healthy' : 'unhealthy',
        },
        redis: {
          connected: redisConnected,
          status: redisConnected ? 'healthy' : 'unhealthy',
        },
      },
    };
  }

  @Get('mongodb')
  @ApiOperation({ summary: 'Get MongoDB connection status' })
  @ApiResponse({ status: 200, description: 'MongoDB status retrieved successfully' })
  async getMongoHealth() {
    const connectionStatus = await this.databaseService.getConnectionStatus();
    const ping = await this.databaseService.ping();

    return {
      ...connectionStatus,
      ping,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Get Redis connection status' })
  @ApiResponse({ status: 200, description: 'Redis status retrieved successfully' })
  async getRedisHealth() {
    try {
      const client = this.redisService.getClient();
      const ping = await client.ping();
      const info = await client.info('server');
      
      return {
        status: 'connected',
        ping: ping === 'PONG',
        info: info.split('\r\n').reduce((acc, line) => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            acc[key] = value;
          }
          return acc;
        }, {}),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected',
        ping: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
} 