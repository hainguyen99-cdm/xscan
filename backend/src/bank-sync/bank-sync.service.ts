import { Injectable, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankTransaction, BankTransactionDocument } from './schemas/bank-transaction.schema';
import { UsersService } from '../users/users.service';
import { OBSWidgetGateway } from '../obs-settings/obs-widget.gateway';
import { BankDonationTotalService } from '../obs-settings/bank-donation-total.service';
import { OBSSettingsService } from '../obs-settings/obs-settings.service';
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
export class BankSyncService implements OnModuleInit {
	private readonly logger = new Logger(BankSyncService.name);
	private readonly REQUEST_TIMEOUT_MS = this.configService.bankRequestTimeoutMs;
	private readonly MAX_RETRIES = this.configService.bankMaxRetries;
	private readonly RETRY_DELAY_MS = this.configService.bankRetryDelayMs;
	private readonly DEFAULT_DONATION_DISPLAY_MS = 5000; // default display duration per donation to space alerts

	private readonly alertQueues = new Map<string, AlertState>();
	private readonly alertTimeouts = new Map<string, NodeJS.Timeout>();

	constructor(
		@InjectModel(BankTransaction.name) private readonly bankTxModel: Model<BankTransactionDocument>,
		@Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
		@Inject(forwardRef(() => OBSWidgetGateway)) private readonly obsWidgetGateway: OBSWidgetGateway,
		@Inject(forwardRef(() => BankDonationTotalService)) private readonly bankDonationTotalService: BankDonationTotalService,
		@Inject(forwardRef(() => OBSSettingsService)) private readonly obsSettingsService: OBSSettingsService,
		private readonly configService: ConfigService,
	) {}

	onModuleInit() {
		// Setup event listener after module initialization
		if (this.obsWidgetGateway && this.obsWidgetGateway.server) {
			this.obsWidgetGateway.server.on('alertCompleted', (data: { alertId: string, streamerId: string }) => {
				this.handleAlertCompleted(data.streamerId, data.alertId);
			});
			this.logger.log('Alert completion event listener setup completed');
		}
	}

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
			state = { 
				queue: [], 
				processing: false, 
				inQueueRefs: new Set<string>(),
				waitingForAck: false
			};
			this.alertQueues.set(streamerId, state);
		}
		if (state.inQueueRefs.has(alert.reference)) return;
		
		// Add timestamp and alertId if not present
		const enhancedAlert: DonationAlert = {
			...alert,
			timestamp: alert.timestamp || new Date(),
			alertId: alert.alertId || `${streamerId}_${alert.reference}_${Date.now()}`
		};
		
		state.queue.push(enhancedAlert);
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
			// Get OBS settings to determine display duration
			let displayDuration = this.DEFAULT_DONATION_DISPLAY_MS;
			try {
				const obsSettings = await this.obsSettingsService.findByStreamerId(streamerId);
				if (obsSettings?.displaySettings?.duration) {
					displayDuration = obsSettings.displaySettings.duration;
					this.logger.debug(`Using OBS display duration: ${displayDuration}ms for streamer ${streamerId}`);
				} else {
					this.logger.debug(`Using default display duration: ${displayDuration}ms for streamer ${streamerId}`);
				}
			} catch (err) {
				this.logger.warn(`Failed to get OBS settings for streamer ${streamerId}, using default duration: ${err?.message || err}`);
			}

			while (state.queue.length > 0) {
				const next = state.queue.shift() as DonationAlert;
				state.inQueueRefs.delete(next.reference);
				
				// Set current alert and waiting state
				state.currentAlertId = next.alertId;
				state.waitingForAck = true;
				
				// Send donation alert with unique ID
				this.obsWidgetGateway.sendDonationAlertWithId(
					next.streamerId, 
					next.donorName, 
					next.amount, 
					next.currency, 
					next.message,
					next.alertId
				);
				
				// Update bank donation total for OBS bank total widgets
				this.bankDonationTotalService.handleNewBankDonation(next.streamerId, {
					amount: next.amount,
					currency: next.currency,
					transactionId: next.reference,
				});
				
				// Compute effective display duration based on per-level settings (fadeIn + duration + fadeOut)
				let effectiveMs = displayDuration;
				try {
					const settings = await this.obsSettingsService.findByStreamerId(next.streamerId);
					if (settings) {
						const settingsResult: any = (this.obsSettingsService as any).getSettingsForDonation?.(settings, next.amount, next.currency);
						const alertSettings = settingsResult?.settings || {};
						const disp = alertSettings.displaySettings || settings.displaySettings || {};
						const fadeIn = typeof disp.fadeInDuration === 'number' ? disp.fadeInDuration : 300;
						const main = typeof disp.duration === 'number' ? disp.duration : this.DEFAULT_DONATION_DISPLAY_MS;
						const fadeOut = typeof disp.fadeOutDuration === 'number' ? disp.fadeOutDuration : 300;
						effectiveMs = fadeIn + main + fadeOut;
					}
				} catch (e) {
					this.logger.warn(`Failed to compute effective display duration for ${next.streamerId}: ${e?.message || e}`);
				}
				
				// Set timeout for acknowledgment (fallback) with buffer
				const timeout = setTimeout(() => {
					this.logger.warn(`Alert ${next.alertId} timeout for streamer ${streamerId}, proceeding to next`);
					this.handleAlertCompleted(streamerId, next.alertId!);
				}, effectiveMs + 2000); // buffer to allow client animation completion
				
				this.alertTimeouts.set(next.alertId!, timeout);
				
				// Wait for acknowledgment or timeout
				await this.waitForAlertCompletion(streamerId, next.alertId!);
			}
		} catch (err) {
			this.logger.warn(`Queue processing error for ${streamerId}: ${err?.message || err}`);
		} finally {
			state.processing = false;
		}
	}

	private async waitForAlertCompletion(streamerId: string, alertId: string): Promise<void> {
		const state = this.alertQueues.get(streamerId);
		if (!state) return;
		
		return new Promise((resolve) => {
			const checkInterval = setInterval(() => {
				if (!state.waitingForAck || state.currentAlertId !== alertId) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		});
	}

	// Method to be called when frontend acknowledges alert completion
	handleAlertCompleted(streamerId: string, alertId: string): void {
		const state = this.alertQueues.get(streamerId);
		if (!state) return;
		
		if (state.currentAlertId === alertId) {
			state.waitingForAck = false;
			state.currentAlertId = undefined;
			
			// Clear timeout
			const timeout = this.alertTimeouts.get(alertId);
			if (timeout) {
				clearTimeout(timeout);
				this.alertTimeouts.delete(alertId);
			}
			
			// Continue processing queue
			if (state.queue.length > 0) {
				void this.processQueue(streamerId);
			}
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
	readonly alertId?: string;
	readonly timestamp?: Date;
}

interface AlertState {
	queue: DonationAlert[];
	processing: boolean;
	inQueueRefs: Set<string>;
	currentAlertId?: string;
	waitingForAck: boolean;
}


