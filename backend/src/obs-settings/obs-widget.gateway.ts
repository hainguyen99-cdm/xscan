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
  // Add optional settings data for test alerts
  settings?: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
  };
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

  /**
   * Send donation alert to all OBS widgets in a streamer's room
   */
  sendDonationAlert(streamerId: string, donorName: string, amount: number, currency: string, message?: string) {
    const roomName = `streamer:${streamerId}`;
    const alert: OBSWidgetAlert = {
      type: 'donationAlert',
      streamerId,
      donorName,
      amount: `${amount} ${currency}`,
      message,
      timestamp: new Date(),
    };

    this.server.to(roomName).emit('donationAlert', alert);
    this.logger.log(
      `Sent donation alert to OBS widgets in room ${roomName}: ${donorName} donated ${amount} ${currency}`,
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