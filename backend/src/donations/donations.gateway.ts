import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { Donation } from './schemas/donation.schema';

export interface DonationAlert {
  donationId: string;
  streamerId: string;
  donorName: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  timestamp: Date;
}

export interface TestAlert {
  alertId: string;
  streamerId: string;
  donorName: string;
  amount: string;
  message: string;
  timestamp: Date;
  isTest: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/donations',
})
export class DonationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DonationsGateway.name);
  private readonly streamerRooms = new Map<string, Set<string>>(); // streamerId -> Set of socketIds

  afterInit(server: Server) {
    this.logger.log('Donations WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all streamer rooms
    this.streamerRooms.forEach((clients, streamerId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.streamerRooms.delete(streamerId);
        }
      }
    });
  }

  @SubscribeMessage('joinStreamerRoom')
  @UseGuards(WsJwtGuard)
  handleJoinStreamerRoom(client: Socket, streamerId: string) {
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

    this.logger.log(`Client ${client.id} joined streamer room: ${streamerId}`);
    client.emit('joinedStreamerRoom', { streamerId, roomName });
  }

  @SubscribeMessage('leaveStreamerRoom')
  @UseGuards(WsJwtGuard)
  handleLeaveStreamerRoom(client: Socket, streamerId: string) {
    const roomName = `streamer:${streamerId}`;
    client.leave(roomName);

    // Remove client from tracking
    const clients = this.streamerRooms.get(streamerId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.streamerRooms.delete(streamerId);
      }
    }

    this.logger.log(`Client ${client.id} left streamer room: ${streamerId}`);
    client.emit('leftStreamerRoom', { streamerId, roomName });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Send donation alert to all clients in a streamer's room
   */
  sendDonationAlert(streamerId: string, donation: Donation, donorName: string) {
    const roomName = `streamer:${streamerId}`;
    const alert: DonationAlert = {
      donationId: donation._id.toString(),
      streamerId: donation.streamerId.toString(),
      donorName,
      amount: donation.amount,
      currency: donation.currency,
      message: donation.message,
      isAnonymous: donation.isAnonymous,
      timestamp: donation.createdAt,
    };

    this.server.to(roomName).emit('donationAlert', alert);
    this.logger.log(
      `Sent donation alert to room ${roomName}: ${donorName} donated ${donation.amount} ${donation.currency}`,
    );
  }

  /**
   * Send donation alert to specific client (for testing)
   */
  sendDonationAlertToClient(clientId: string, alert: DonationAlert) {
    this.server.to(clientId).emit('donationAlert', alert);
  }

  /**
   * Send test alert to all clients in a streamer's room
   */
  sendTestAlert(streamerId: string, testAlert: TestAlert) {
    const roomName = `streamer:${streamerId}`;
    
    this.server.to(roomName).emit('testAlert', testAlert);
    this.logger.log(
      `Sent test alert to room ${roomName}: ${testAlert.donorName} - ${testAlert.amount}`,
    );
  }

  /**
   * Send test alert to specific client (for testing)
   */
  sendTestAlertToClient(clientId: string, testAlert: TestAlert) {
    this.server.to(clientId).emit('testAlert', testAlert);
  }

  /**
   * Get connected clients count for a streamer
   */
  getStreamerClientCount(streamerId: string): number {
    const clients = this.streamerRooms.get(streamerId);
    return clients ? clients.size : 0;
  }

  /**
   * Get all connected streamers
   */
  getConnectedStreamers(): string[] {
    return Array.from(this.streamerRooms.keys());
  }
}
