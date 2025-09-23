import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OBSSettingsService } from './obs-settings.service';
export interface OBSWidgetAlert {
    type: 'donationAlert' | 'testAlert';
    streamerId: string;
    donorName: string;
    amount: string;
    message?: string;
    timestamp: Date;
    isTest?: boolean;
    settings?: {
        imageSettings?: any;
        soundSettings?: any;
        animationSettings?: any;
        styleSettings?: any;
        positionSettings?: any;
        displaySettings?: any;
        generalSettings?: any;
        donationLevel?: {
            levelId: string;
            levelName: string;
            minAmount: number;
            maxAmount: number;
            currency: string;
        };
    };
}
export declare class OBSWidgetGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly obsSettingsService;
    server: Server;
    private readonly logger;
    private readonly streamerRooms;
    private readonly tokenToStreamerId;
    constructor(obsSettingsService: OBSSettingsService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private joinStreamerRoom;
    private removeClientFromStreamerRoom;
    handlePing(client: Socket): void;
    sendDonationAlert(streamerId: string, donorName: string, amount: number, currency: string, message?: string): Promise<void>;
    sendTestAlert(streamerId: string, donorName: string, amount: string, message: string, settings?: any): void;
    getStreamerClientCount(streamerId: string): number;
    getConnectedStreamers(): string[];
}
