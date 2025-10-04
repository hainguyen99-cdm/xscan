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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OBSWidgetGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSWidgetGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const obs_settings_service_1 = require("./obs-settings.service");
let OBSWidgetGateway = OBSWidgetGateway_1 = class OBSWidgetGateway {
    constructor(obsSettingsService) {
        this.obsSettingsService = obsSettingsService;
        this.logger = new common_1.Logger(OBSWidgetGateway_1.name);
        this.streamerRooms = new Map();
        this.tokenToStreamerId = new Map();
    }
    afterInit(server) {
        this.logger.log('OBS Widget WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        this.logger.log(`OBS Widget client connected: ${client.id}`);
        const alertToken = client.handshake.query.alertToken;
        if (!alertToken) {
            this.logger.log(`Client ${client.id} connected without alert token (likely bank donation total widget)`);
            client.data.isBankTotalWidget = true;
            return;
        }
        try {
            const clientIp = client.handshake.address;
            const userAgent = client.handshake.headers['user-agent'];
            const validationResult = await this.obsSettingsService.findByAlertTokenWithSecurity(alertToken, clientIp, userAgent);
            const streamerId = validationResult.streamerId.toString();
            this.tokenToStreamerId.set(alertToken, streamerId);
            client.data.alertToken = alertToken;
            client.data.streamerId = streamerId;
            client.data.clientIp = clientIp;
            client.data.userAgent = userAgent;
            this.logger.log(`OBS Widget client ${client.id} authenticated for streamer: ${streamerId} from IP: ${clientIp}`);
            await this.joinStreamerRoom(client, streamerId);
        }
        catch (error) {
            this.logger.warn(`Invalid alert token from client ${client.id}: ${alertToken}`, error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`OBS Widget client disconnected: ${client.id}`);
        if (client.data?.isBankTotalWidget) {
            this.logger.log(`Bank total widget ${client.id} disconnected`);
            return;
        }
        if (client.data?.streamerId) {
            this.removeClientFromStreamerRoom(client.id, client.data.streamerId);
        }
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
    async joinStreamerRoom(client, streamerId) {
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
        this.logger.log(`OBS Widget client ${client.id} joined streamer room: ${streamerId}`);
        client.emit('joinedStreamerRoom', { streamerId, roomName });
    }
    removeClientFromStreamerRoom(clientId, streamerId) {
        const clients = this.streamerRooms.get(streamerId);
        if (clients) {
            clients.delete(clientId);
            if (clients.size === 0) {
                this.streamerRooms.delete(streamerId);
            }
        }
    }
    handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
    handleJoinBankTotalRoom(client, data) {
        const { streamerId } = data;
        if (!streamerId) {
            client.emit('error', { message: 'Streamer ID is required' });
            return;
        }
        const roomName = `streamer-${streamerId}`;
        client.join(roomName);
        client.data.isBankTotalWidget = true;
        client.data.streamerId = streamerId;
        this.logger.log(`Bank total widget ${client.id} joined room: ${roomName} for streamer: ${streamerId}`);
        client.emit('joinedBankTotalRoom', { streamerId, roomName });
    }
    async sendBankDonationTotalUpdate(streamerId, totalData) {
        const update = {
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
        this.server.to(`streamer-${streamerId}`).emit('bankDonationTotalUpdate', update);
    }
    async sendDonationAlert(streamerId, donorName, amount, currency, message) {
        const roomName = `streamer:${streamerId}`;
        let settings;
        let alertSettings = null;
        let matchingLevel = null;
        let behavior = 'unknown';
        try {
            settings = await this.obsSettingsService.findByStreamerId(streamerId);
            const settingsResult = this.obsSettingsService.getSettingsForDonation(settings, amount, currency);
            alertSettings = settingsResult.settings;
            matchingLevel = settingsResult.level;
            behavior = settingsResult.behavior;
            if (behavior.startsWith('donation-levels') && matchingLevel && alertSettings) {
                const levelCfg = matchingLevel.configuration || {};
                const levelCz = matchingLevel.customization || {};
                const resolveLevelImageUrl = () => (levelCz.image?.url || levelCfg.imageSettings?.url || levelCfg.imageUrl);
                const resolveLevelSoundUrl = () => (levelCz.sound?.url || levelCfg.soundSettings?.url || levelCfg.soundUrl);
                const ensureSettingsBranch = (obj, key) => {
                    if (!obj[key])
                        obj[key] = {};
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
        }
        catch (error) {
            this.logger.warn(`Failed to get settings for donation level determination: ${error.message}`);
        }
        const alert = {
            type: 'donationAlert',
            streamerId,
            donorName,
            amount: `${amount} ${currency}`,
            message,
            timestamp: new Date(),
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
        try {
            const imgUrl = alert.settings?.imageSettings?.url;
            const sndUrl = alert.settings?.soundSettings?.url;
            const short = (u) => (u ? (u.length > 80 ? u.substring(0, 77) + '...' : u) : 'none');
            this.logger.log(`Alert media debug - img: ${short(imgUrl)}, sound: ${short(sndUrl)}`);
        }
        catch { }
        this.server.to(roomName).emit('donationAlert', alert);
        this.logger.log(`Sent donation alert to OBS widgets in room ${roomName}: ${donorName} donated ${amount} ${currency} (behavior: ${behavior})`);
    }
    sendTestAlert(streamerId, donorName, amount, message, settings) {
        const roomName = `streamer:${streamerId}`;
        const alert = {
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
        this.logger.log(`Sent test alert to OBS widgets in room ${roomName}: ${donorName} - ${amount}`);
    }
    getStreamerClientCount(streamerId) {
        const clients = this.streamerRooms.get(streamerId);
        return clients ? clients.size : 0;
    }
    getConnectedStreamers() {
        return Array.from(this.streamerRooms.keys());
    }
};
exports.OBSWidgetGateway = OBSWidgetGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OBSWidgetGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], OBSWidgetGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinBankTotalRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], OBSWidgetGateway.prototype, "handleJoinBankTotalRoom", null);
exports.OBSWidgetGateway = OBSWidgetGateway = OBSWidgetGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        namespace: '/obs-widget',
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => obs_settings_service_1.OBSSettingsService))),
    __metadata("design:paramtypes", [obs_settings_service_1.OBSSettingsService])
], OBSWidgetGateway);
//# sourceMappingURL=obs-widget.gateway.js.map