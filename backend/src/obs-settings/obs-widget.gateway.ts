import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { OBSSettingsService } from './obs-settings.service';

export interface OBSWidgetAlert {
  type: 'donationAlert' | 'testAlert';
  streamerId: string;
  donorName: string;
  amount: string;
  message?: string;
  timestamp: Date;
  isTest?: boolean;
  // Add optional settings data for both donation and test alerts
  settings?: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
    // Include donation level info if applicable
    donationLevel?: {
      levelId: string;
      levelName: string;
      minAmount: number;
      maxAmount: number;
      currency: string;
    };
  };
}

export interface BankDonationTotalUpdate {
  type: 'bankDonationTotalUpdate';
  streamerId: string;
  totalAmount: number;
  currency: string;
  transactionCount: number;
  lastDonationDate?: Date;
  averageDonation?: number;
  todayDonations?: number;
  thisWeekDonations?: number;
  thisMonthDonations?: number;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/obs-widget',
})
export class OBSWidgetGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OBSWidgetGateway.name);
  private readonly streamerRooms = new Map<string, Set<string>>(); // streamerId -> Set of socketIds
  private readonly tokenToStreamerId = new Map<string, string>(); // alertToken -> streamerId

  constructor(
    @Inject(forwardRef(() => OBSSettingsService))
    private readonly obsSettingsService: OBSSettingsService
  ) {}

  afterInit(server: Server) {
    this.logger.log('OBS Widget WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`OBS Widget client connected: ${client.id}`);
    
    // Extract alert token from query parameters
    const alertToken = client.handshake.query.alertToken as string;
    
    if (!alertToken) {
      this.logger.warn(`Client ${client.id} connected without alert token`);
      client.disconnect();
      return;
    }

    try {
      // Get client IP and user agent for security validation
      const clientIp = client.handshake.address;
      const userAgent = client.handshake.headers['user-agent'];

      // Use enhanced security validation
      const validationResult = await this.obsSettingsService.findByAlertTokenWithSecurity(
        alertToken,
        clientIp,
        userAgent
      );
      
      const streamerId = validationResult.streamerId.toString();
      
      // Store token to streamer mapping
      this.tokenToStreamerId.set(alertToken, streamerId);
      
      // Store client info
      client.data.alertToken = alertToken;
      client.data.streamerId = streamerId;
      client.data.clientIp = clientIp;
      client.data.userAgent = userAgent;
      
      this.logger.log(`OBS Widget client ${client.id} authenticated for streamer: ${streamerId} from IP: ${clientIp}`);
      
      // Join streamer room automatically
      await this.joinStreamerRoom(client, streamerId);
      
    } catch (error) {
      this.logger.warn(`Invalid alert token from client ${client.id}: ${alertToken}`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`OBS Widget client disconnected: ${client.id}`);
    
    // Remove client from streamer room
    if (client.data?.streamerId) {
      this.removeClientFromStreamerRoom(client.id, client.data.streamerId);
    }
    
    // Clean up token mapping if this was the last client for this token
    if (client.data?.alertToken) {
      const streamerId = this.tokenToStreamerId.get(client.data.alertToken);
      if (streamerId) {
        const clients = this.streamerRooms.get(streamerId);
        if (clients && clients.size === 0) {
          this.tokenToStreamerId.delete(client.data.alertToken);
        }
      }
    }
  }

  private async joinStreamerRoom(client: Socket, streamerId: string) {
    // Leave previous rooms
    client.rooms.forEach((room) => {
      if (room.startsWith('streamer:')) {
        client.leave(room);
      }
    });

    // Join new streamer room
    const roomName = `streamer:${streamerId}`;
    client.join(roomName);

    // Track client in streamer room
    if (!this.streamerRooms.has(streamerId)) {
      this.streamerRooms.set(streamerId, new Set());
    }
    this.streamerRooms.get(streamerId).add(client.id);

    this.logger.log(`OBS Widget client ${client.id} joined streamer room: ${streamerId}`);
    client.emit('joinedStreamerRoom', { streamerId, roomName });
  }

  private removeClientFromStreamerRoom(clientId: string, streamerId: string) {
    const clients = this.streamerRooms.get(streamerId);
    if (clients) {
      clients.delete(clientId);
      if (clients.size === 0) {
        this.streamerRooms.delete(streamerId);
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('joinBankTotalRoom')
  handleJoinBankTotalRoom(client: Socket, data: { streamerId: string }) {
    const { streamerId } = data;
    if (!streamerId) {
      client.emit('error', { message: 'Streamer ID is required' });
      return;
    }

    const roomName = `streamer-${streamerId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined bank total room: ${roomName}`);
    
    client.emit('joinedBankTotalRoom', { streamerId, roomName });
  }

  /**
   * Send bank donation total update to all widgets in a streamer's room
   */
  async sendBankDonationTotalUpdate(streamerId: string, totalData: {
    totalAmount: number;
    currency: string;
    transactionCount: number;
    lastDonationDate?: Date;
    averageDonation?: number;
    todayDonations?: number;
    thisWeekDonations?: number;
    thisMonthDonations?: number;
  }) {
    const update: BankDonationTotalUpdate = {
      type: 'bankDonationTotalUpdate',
      streamerId,
      totalAmount: totalData.totalAmount,
      currency: totalData.currency,
      transactionCount: totalData.transactionCount,
      lastDonationDate: totalData.lastDonationDate,
      averageDonation: totalData.averageDonation,
      todayDonations: totalData.todayDonations,
      thisWeekDonations: totalData.thisWeekDonations,
      thisMonthDonations: totalData.thisMonthDonations,
      timestamp: new Date(),
    };

    this.logger.log(`Broadcasting bank donation total update for streamer ${streamerId}: ${totalData.totalAmount} ${totalData.currency}`);
    
    // Send to all clients in the streamer's room
    this.server.to(`streamer-${streamerId}`).emit('bankDonationTotalUpdate', update);
  }

  /**
   * Send donation alert to all OBS widgets in a streamer's room
   */
  async sendDonationAlert(streamerId: string, donorName: string, amount: number, currency: string, message?: string) {
    const roomName = `streamer:${streamerId}`;
    
    // Get OBS settings and determine which settings to use
    let settings;
    let alertSettings = null;
    let matchingLevel = null;
    let behavior = 'unknown';
    
    try {
      settings = await this.obsSettingsService.findByStreamerId(streamerId);
      
      // Get the appropriate settings based on streamer's configuration
      const settingsResult = this.obsSettingsService.getSettingsForDonation(settings, amount, currency);
      alertSettings = settingsResult.settings;
      matchingLevel = settingsResult.level;
      behavior = settingsResult.behavior;

      // Final enforcement: if behavior is donation-levels and a level matched,
      // force media URLs from the level (no basic fallback), even if merge leaked.
      if (behavior.startsWith('donation-levels') && matchingLevel && alertSettings) {
        const levelCfg: any = matchingLevel.configuration || {};
        const levelCz: any = (matchingLevel as any).customization || {};
        const resolveLevelImageUrl = () => (
          levelCz.image?.url || levelCfg.imageSettings?.url || (levelCfg as any).imageUrl
        );
        const resolveLevelSoundUrl = () => (
          levelCz.sound?.url || levelCfg.soundSettings?.url || (levelCfg as any).soundUrl
        );
        const ensureSettingsBranch = (obj: any, key: string) => {
          if (!obj[key]) obj[key] = {};
          return obj[key];
        };
        const lvlImg = resolveLevelImageUrl();
        const lvlSnd = resolveLevelSoundUrl();
        if (lvlImg) {
          const imgSettings = ensureSettingsBranch(alertSettings, 'imageSettings');
          imgSettings.url = lvlImg;
        }
        if (lvlSnd) {
          const sndSettings = ensureSettingsBranch(alertSettings, 'soundSettings');
          sndSettings.url = lvlSnd;
        }
      }
      
      this.logger.log(`Settings behavior: ${behavior} for amount ${amount} ${currency}`);
    } catch (error) {
      this.logger.warn(`Failed to get settings for donation level determination: ${error.message}`);
    }

    const alert: OBSWidgetAlert = {
      type: 'donationAlert',
      streamerId,
      donorName,
      amount: `${amount} ${currency}`,
      message,
      timestamp: new Date(),
      // Include the determined settings
      settings: alertSettings ? {
        ...alertSettings,
        donationLevel: matchingLevel ? {
          levelId: matchingLevel.levelId,
          levelName: matchingLevel.levelName,
          minAmount: matchingLevel.minAmount,
          maxAmount: matchingLevel.maxAmount,
          currency: matchingLevel.currency
        } : undefined,
        settingsBehavior: behavior
      } : (settings ? settings.toObject() : null),
    };

    // Debug: log media URLs being sent to the widget
    try {
      const imgUrl = (alert.settings as any)?.imageSettings?.url;
      const sndUrl = (alert.settings as any)?.soundSettings?.url;
      const short = (u?: string) => (u ? (u.length > 80 ? u.substring(0, 77) + '...' : u) : 'none');
      this.logger.log(`Alert media debug - img: ${short(imgUrl)}, sound: ${short(sndUrl)}`);
    } catch {}

    this.server.to(roomName).emit('donationAlert', alert);
    this.logger.log(
      `Sent donation alert to OBS widgets in room ${roomName}: ${donorName} donated ${amount} ${currency} (behavior: ${behavior})`,
    );
  }

  /**
   * Send test alert to all OBS widgets in a streamer's room
   */
  sendTestAlert(streamerId: string, donorName: string, amount: string, message: string, settings?: any) {
    const roomName = `streamer:${streamerId}`;
    const alert: OBSWidgetAlert = {
      type: 'testAlert',
      streamerId,
      donorName,
      amount,
      message,
      timestamp: new Date(),
      isTest: true,
      settings,
    };
    
    this.server.to(roomName).emit('testAlert', alert);
    this.logger.log(
      `Sent test alert to OBS widgets in room ${roomName}: ${donorName} - ${amount}`,
    );
  }

  /**
   * Get connected OBS widget clients count for a streamer
   */
  getStreamerClientCount(streamerId: string): number {
    const clients = this.streamerRooms.get(streamerId);
    return clients ? clients.size : 0;
  }

  /**
   * Get all streamers with connected OBS widgets
   */
  getConnectedStreamers(): string[] {
    return Array.from(this.streamerRooms.keys());
  }
} 