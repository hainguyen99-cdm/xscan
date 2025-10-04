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
var BankSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bank_transaction_schema_1 = require("./schemas/bank-transaction.schema");
const users_service_1 = require("../users/users.service");
const obs_widget_gateway_1 = require("../obs-settings/obs-widget.gateway");
const bank_donation_total_service_1 = require("../obs-settings/bank-donation-total.service");
const config_service_1 = require("../config/config.service");
let BankSyncService = BankSyncService_1 = class BankSyncService {
    constructor(bankTxModel, usersService, obsWidgetGateway, bankDonationTotalService, configService) {
        this.bankTxModel = bankTxModel;
        this.usersService = usersService;
        this.obsWidgetGateway = obsWidgetGateway;
        this.bankDonationTotalService = bankDonationTotalService;
        this.configService = configService;
        this.logger = new common_1.Logger(BankSyncService_1.name);
        this.REQUEST_TIMEOUT_MS = this.configService.bankRequestTimeoutMs;
        this.MAX_RETRIES = this.configService.bankMaxRetries;
        this.RETRY_DELAY_MS = this.configService.bankRetryDelayMs;
        this.DONATION_DISPLAY_MS = 3000;
        this.alertQueues = new Map();
    }
    async pollAllStreamers() {
        try {
            const streamers = await this.usersService.findUsersWithBankToken();
            if (!streamers || streamers.length === 0) {
                return;
            }
            await Promise.all(streamers.map((s) => this.syncStreamerTransactions(s._id.toString(), s.bankToken)));
        }
        catch (err) {
            this.logger.error('Failed to poll streamers bank transactions', err.stack || err.message);
        }
    }
    async syncStreamerTransactions(streamerId, bankToken) {
        if (!bankToken)
            return;
        const headers = {
            Code: this.configService.darkVcbCode || '',
            Token: bankToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(this.configService.darkVcbCookie ? { Cookie: this.configService.darkVcbCookie } : {}),
        };
        try {
            const data = await this.fetchVcbTransactions(headers);
            const items = data?.data?.ChiTietGiaoDich || [];
            if (items.length === 0)
                return;
            for (const item of items) {
                const isCredit = (item.CD === '+' || !!item.SoTienGhiCo) ? true : false;
                if (!isCredit)
                    continue;
                const amountNum = this.parseAmount(item.SoTienGhiCo || '0');
                if (amountNum <= 0)
                    continue;
                const existed = await this.bankTxModel.findOne({ streamerId: new mongoose_2.Types.ObjectId(streamerId), reference: item.SoThamChieu }).lean();
                if (existed)
                    continue;
                await this.bankTxModel.create({
                    streamerId: new mongoose_2.Types.ObjectId(streamerId),
                    reference: item.SoThamChieu,
                    description: item.MoTa,
                    amount: amountNum,
                    currency: 'VND',
                    transactionDate: new Date(item.NgayGiaoDich),
                    raw: item,
                });
                const donorName = 'Anonymous';
                const message = this.extractTransferMessage(item.MoTa || '');
                this.enqueueDonation(streamerId, {
                    streamerId,
                    donorName,
                    amount: amountNum,
                    currency: 'VND',
                    message,
                    reference: item.SoThamChieu,
                });
            }
        }
        catch (error) {
            this.logger.warn(`Failed to sync streamer ${streamerId}: ${error?.message || error}`);
        }
    }
    async fetchVcbTransactions(headers) {
        const form = new URLSearchParams();
        form.append('Loai_api', 'lsgd');
        let lastError;
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const response = await axios_1.default.post(this.configService.darkVcbEndpoint, form, {
                    headers,
                    timeout: this.REQUEST_TIMEOUT_MS,
                    validateStatus: (status) => status >= 200 && status < 500,
                });
                if (response.status >= 200 && response.status < 300) {
                    return response.data;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            catch (err) {
                lastError = err;
                const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
                const isNetwork = err?.isAxiosError && !err?.response;
                if (attempt < this.MAX_RETRIES && (isTimeout || isNetwork)) {
                    await this.delay(this.RETRY_DELAY_MS);
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    parseAmount(input) {
        const normalized = (input || '').replace(/[^\d]/g, '');
        const value = parseInt(normalized, 10);
        return Number.isFinite(value) ? value : 0;
    }
    extractDonorName(description) {
        if (!description)
            return undefined;
        const match = description.match(/\.([A-ZÀ-Ỹ\s]+)\./i);
        if (match && match[1])
            return match[1].trim();
        return undefined;
    }
    extractTransferMessage(description) {
        if (!description)
            return '';
        const segments = description.split('.');
        for (const seg of segments) {
            const idx = seg.indexOf(' chuyen');
            if (idx > 0) {
                return seg.substring(0, idx + ' chuyen'.length).trim();
            }
        }
        if (segments.length > 1) {
            const nameCandidate = segments[1].match(/[A-ZÀ-Ỹ\s]{3,}/);
            if (nameCandidate?.[0]) {
                return nameCandidate[0].trim();
            }
        }
        return description;
    }
    enqueueDonation(streamerId, alert) {
        let state = this.alertQueues.get(streamerId);
        if (!state) {
            state = { queue: [], processing: false, inQueueRefs: new Set() };
            this.alertQueues.set(streamerId, state);
        }
        if (state.inQueueRefs.has(alert.reference))
            return;
        state.queue.push(alert);
        state.inQueueRefs.add(alert.reference);
        if (!state.processing) {
            void this.processQueue(streamerId);
        }
    }
    async processQueue(streamerId) {
        const state = this.alertQueues.get(streamerId);
        if (!state)
            return;
        if (state.processing)
            return;
        state.processing = true;
        try {
            while (state.queue.length > 0) {
                const next = state.queue.shift();
                state.inQueueRefs.delete(next.reference);
                this.obsWidgetGateway.sendDonationAlert(next.streamerId, next.donorName, next.amount, next.currency, next.message);
                this.bankDonationTotalService.handleNewBankDonation(next.streamerId, {
                    amount: next.amount,
                    currency: next.currency,
                    transactionId: next.reference,
                });
                await this.delay(this.DONATION_DISPLAY_MS);
            }
        }
        catch (err) {
            this.logger.warn(`Queue processing error for ${streamerId}: ${err?.message || err}`);
        }
        finally {
            state.processing = false;
        }
    }
};
exports.BankSyncService = BankSyncService;
__decorate([
    (0, schedule_1.Cron)(process.env.BANK_POLL_CRON || '*/10 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankSyncService.prototype, "pollAllStreamers", null);
exports.BankSyncService = BankSyncService = BankSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bank_transaction_schema_1.BankTransaction.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => obs_widget_gateway_1.OBSWidgetGateway))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => bank_donation_total_service_1.BankDonationTotalService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        obs_widget_gateway_1.OBSWidgetGateway,
        bank_donation_total_service_1.BankDonationTotalService,
        config_service_1.ConfigService])
], BankSyncService);
//# sourceMappingURL=bank-sync.service.js.map