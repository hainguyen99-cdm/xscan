import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankTransaction, BankTransactionDocument } from './schemas/bank-transaction.schema';
import { UsersService } from '../users/users.service';
import { OBSWidgetGateway } from '../obs-settings/obs-widget.gateway';
import { ConfigService } from '../config/config.service';

interface VcbTransactionItem {
	SoThamChieu: string;
	MoTa: string;
	SoTienGhiCo?: string;
	SoTienGhiNo?: string;
	NgayGiaoDich: string; // YYYY-MM-DD
	CD?: string; // '+' or '-'
}

interface VcbResponse {
	data?: {
		ChiTietGiaoDich?: VcbTransactionItem[];
	};
}

@Injectable()
export class BankSyncService {
	private readonly logger = new Logger(BankSyncService.name);
	private readonly REQUEST_TIMEOUT_MS = this.configService.bankRequestTimeoutMs;
	private readonly MAX_RETRIES = this.configService.bankMaxRetries;
	private readonly RETRY_DELAY_MS = this.configService.bankRetryDelayMs;
	private readonly DONATION_DISPLAY_MS = 3000; // display duration per donation to space alerts

	private readonly alertQueues = new Map<string, { queue: DonationAlert[]; processing: boolean; inQueueRefs: Set<string> }>();

	constructor(
		@InjectModel(BankTransaction.name) private readonly bankTxModel: Model<BankTransactionDocument>,
		@Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
		@Inject(forwardRef(() => OBSWidgetGateway)) private readonly obsWidgetGateway: OBSWidgetGateway,
		private readonly configService: ConfigService,
	) {}

	@Cron(process.env.BANK_POLL_CRON || '*/10 * * * * *')
	async pollAllStreamers(): Promise<void> {
		try {
			const streamers = await this.usersService.findUsersWithBankToken();
			if (!streamers || streamers.length === 0) {
				return;
			}
			await Promise.all(streamers.map((s) => this.syncStreamerTransactions(s._id.toString(), s.bankToken)));
		} catch (err) {
			this.logger.error('Failed to poll streamers bank transactions', err.stack || err.message);
		}
	}

	private async syncStreamerTransactions(streamerId: string, bankToken: string): Promise<void> {
		if (!bankToken) return;
		const headers = {
			Code: this.configService.darkVcbCode || '',
			Token: bankToken,
			'Content-Type': 'application/x-www-form-urlencoded',
			...(this.configService.darkVcbCookie ? { Cookie: this.configService.darkVcbCookie } : {}),
		} as Record<string, string>;
		try {
			const data = await this.fetchVcbTransactions(headers);
			const items = data?.data?.ChiTietGiaoDich || [];
			if (items.length === 0) return;
			for (const item of items) {
				const isCredit = (item.CD === '+' || !!item.SoTienGhiCo) ? true : false;
				if (!isCredit) continue; // only donations (credit)
				const amountNum = this.parseAmount(item.SoTienGhiCo || '0');
				if (amountNum <= 0) continue;
				const existed = await this.bankTxModel.findOne({ streamerId: new Types.ObjectId(streamerId), reference: item.SoThamChieu }).lean();
				if (existed) continue;
				await this.bankTxModel.create({
					streamerId: new Types.ObjectId(streamerId),
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
		} catch (error) {
			this.logger.warn(`Failed to sync streamer ${streamerId}: ${error?.message || error}`);
		}
	}

	private async fetchVcbTransactions(headers: Record<string, string>): Promise<VcbResponse> {
        // console.log('fetchVcbTransactions');
		const form = new URLSearchParams();
		form.append('Loai_api', 'lsgd');
		let lastError: unknown;
		for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
			try {
				const response = await axios.post<VcbResponse>(this.configService.darkVcbEndpoint, form, {
					headers,
					timeout: this.REQUEST_TIMEOUT_MS,
					validateStatus: (status) => status >= 200 && status < 500,
				});
				if (response.status >= 200 && response.status < 300) {
					return response.data;
				}
				throw new Error(`HTTP ${response.status}`);
			} catch (err: any) {
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
		throw lastError as any;
	}

	private async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private parseAmount(input: string): number {
		const normalized = (input || '').replace(/[^\d]/g, '');
		const value = parseInt(normalized, 10);
		return Number.isFinite(value) ? value : 0;
	}

	private extractDonorName(description: string): string | undefined {
		if (!description) return undefined;
		const match = description.match(/\.([A-ZÀ-Ỹ\s]+)\./i);
		if (match && match[1]) return match[1].trim();
		return undefined;
	}

	private extractTransferMessage(description: string): string {
		if (!description) return '';
		// Example MoTa:
		// "5259IBT1kJCKF59Q.NGUYEN VAN HAI chuyen FT25259295692069.20250916.162537.19034387989016.VND-TGTT-NGUYEN VAN HAI.970407"
		// Desired message: "NGUYEN VAN HAI chuyen"
		// Strategy:
		// 1) Split by '.' to get segments. Find first segment containing " chuyen" (Vietnamese for transfer)
		// 2) If not found, fallback to the token between the first and second '.' if it looks like name words
		const segments = description.split('.');
		for (const seg of segments) {
			const idx = seg.indexOf(' chuyen');
			if (idx > 0) {
				return seg.substring(0, idx + ' chuyen'.length).trim();
			}
		}
		// Fallback: try to find uppercase name-like token (letters and spaces) in second segment
		if (segments.length > 1) {
			const nameCandidate = segments[1].match(/[A-ZÀ-Ỹ\s]{3,}/);
			if (nameCandidate?.[0]) {
				return nameCandidate[0].trim();
			}
		}
		return description;
	}

	private enqueueDonation(streamerId: string, alert: DonationAlert): void {
		let state = this.alertQueues.get(streamerId);
		if (!state) {
			state = { queue: [], processing: false, inQueueRefs: new Set<string>() };
			this.alertQueues.set(streamerId, state);
		}
		if (state.inQueueRefs.has(alert.reference)) return;
		state.queue.push(alert);
		state.inQueueRefs.add(alert.reference);
		if (!state.processing) {
			void this.processQueue(streamerId);
		}
	}

	private async processQueue(streamerId: string): Promise<void> {
		const state = this.alertQueues.get(streamerId);
		if (!state) return;
		if (state.processing) return;
		state.processing = true;
		try {
			while (state.queue.length > 0) {
				const next = state.queue.shift() as DonationAlert;
				state.inQueueRefs.delete(next.reference);
				this.obsWidgetGateway.sendDonationAlert(next.streamerId, next.donorName, next.amount, next.currency, next.message);
				await this.delay(this.DONATION_DISPLAY_MS);
			}
		} catch (err) {
			this.logger.warn(`Queue processing error for ${streamerId}: ${err?.message || err}`);
		} finally {
			state.processing = false;
		}
	}
}

interface DonationAlert {
	readonly streamerId: string;
	readonly donorName: string;
	readonly amount: number;
	readonly currency: string;
	readonly message: string;
	readonly reference: string;
}


