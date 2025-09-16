import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
export declare class DonationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private readonly streamerRooms;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinStreamerRoom(client: Socket, streamerId: string): void;
    handleLeaveStreamerRoom(client: Socket, streamerId: string): void;
    handlePing(client: Socket): void;
    sendDonationAlert(streamerId: string, donation: Donation, donorName: string): void;
    sendDonationAlertToClient(clientId: string, alert: DonationAlert): void;
    sendTestAlert(streamerId: string, testAlert: TestAlert): void;
    sendTestAlertToClient(clientId: string, testAlert: TestAlert): void;
    getStreamerClientCount(streamerId: string): number;
    getConnectedStreamers(): string[];
}
