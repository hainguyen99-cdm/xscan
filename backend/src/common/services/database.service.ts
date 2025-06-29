import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.checkConnection();
  }

  private async checkConnection(): Promise<void> {
    try {
      if (this.connection.readyState === 1) {
        this.logger.log('MongoDB connection established successfully');
        this.logger.log(`Connected to database: ${this.connection.name}`);
      } else {
        this.logger.warn('MongoDB connection not ready');
      }

      // Set up connection event listeners
      this.connection.on('connected', () => {
        this.logger.log('MongoDB connected');
      });

      this.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error:', error);
      });

      this.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });

      this.connection.on('reconnected', () => {
        this.logger.log('MongoDB reconnected');
      });
    } catch (error) {
      this.logger.error('Failed to check MongoDB connection:', error);
      throw error;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  async isConnected(): Promise<boolean> {
    return this.connection.readyState === 1;
  }

  async getConnectionStatus(): Promise<{
    status: string;
    readyState: number;
    host: string;
    port: number;
    name: string;
  }> {
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: readyStates[this.connection.readyState] || 'unknown',
      readyState: this.connection.readyState,
      host: this.connection.host,
      port: this.connection.port,
      name: this.connection.name,
    };
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.connection.db) {
        this.logger.error('Database connection not available');
        return false;
      }
      await this.connection.db.admin().ping();
      return true;
    } catch (error) {
      this.logger.error('MongoDB ping failed:', error);
      return false;
    }
  }
} 