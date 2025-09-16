"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DonationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("../auth/guards/ws-jwt.guard");
let DonationsGateway = DonationsGateway_1 = class DonationsGateway {
    constructor() {
        this.logger = new common_1.Logger(DonationsGateway_1.name);
        this.streamerRooms = new Map();
    }
    afterInit(server) {
        this.logger.log('Donations WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.streamerRooms.forEach((clients, streamerId) => {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                if (clients.size === 0) {
                    this.streamerRooms.delete(streamerId);
                }
            }
        });
    }
    handleJoinStreamerRoom(client, streamerId) {
        client.rooms.forEach((room) => {
            if (room.startsWith('streamer:')) {
                client.leave(room);
            }
        });
        const roomName = `streamer:${streamerId}`;
        client.join(roomName);
        if (!this.streamerRooms.has(streamerId)) {
            this.streamerRooms.set(streamerId, new Set());
        }
        this.streamerRooms.get(streamerId).add(client.id);
        this.logger.log(`Client ${client.id} joined streamer room: ${streamerId}`);
        client.emit('joinedStreamerRoom', { streamerId, roomName });
    }
    handleLeaveStreamerRoom(client, streamerId) {
        const roomName = `streamer:${streamerId}`;
        client.leave(roomName);
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
    handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
    sendDonationAlert(streamerId, donation, donorName) {
        const roomName = `streamer:${streamerId}`;
        const alert = {
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
        this.logger.log(`Sent donation alert to room ${roomName}: ${donorName} donated ${donation.amount} ${donation.currency}`);
    }
    sendDonationAlertToClient(clientId, alert) {
        this.server.to(clientId).emit('donationAlert', alert);
    }
    sendTestAlert(streamerId, testAlert) {
        const roomName = `streamer:${streamerId}`;
        this.server.to(roomName).emit('testAlert', testAlert);
        this.logger.log(`Sent test alert to room ${roomName}: ${testAlert.donorName} - ${testAlert.amount}`);
    }
    sendTestAlertToClient(clientId, testAlert) {
        this.server.to(clientId).emit('testAlert', testAlert);
    }
    getStreamerClientCount(streamerId) {
        const clients = this.streamerRooms.get(streamerId);
        return clients ? clients.size : 0;
    }
    getConnectedStreamers() {
        return Array.from(this.streamerRooms.keys());
    }
};
exports.DonationsGateway = DonationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], DonationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinStreamerRoom'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], DonationsGateway.prototype, "handleJoinStreamerRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveStreamerRoom'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], DonationsGateway.prototype, "handleLeaveStreamerRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], DonationsGateway.prototype, "handlePing", null);
exports.DonationsGateway = DonationsGateway = DonationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        namespace: '/donations',
    })
], DonationsGateway);
//# sourceMappingURL=donations.gateway.js.map