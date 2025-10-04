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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDonationTotalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bank_donation_total_service_1 = require("./bank-donation-total.service");
const obs_widget_gateway_1 = require("./obs-widget.gateway");
let BankDonationTotalController = class BankDonationTotalController {
    constructor(bankDonationTotalService, obsWidgetGateway) {
        this.bankDonationTotalService = bankDonationTotalService;
        this.obsWidgetGateway = obsWidgetGateway;
        this.logger = {
            error: (message, error) => {
                console.error(message, error);
            },
        };
    }
    async triggerBankDonationTotalUpdate(streamerId) {
        try {
            await this.bankDonationTotalService.broadcastBankDonationTotalUpdate(streamerId);
            return {
                success: true,
                message: 'Bank donation total update triggered',
                streamerId,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to trigger bank donation total update for streamer ${streamerId}:`, error);
            throw new common_1.HttpException({
                success: false,
                error: 'Failed to trigger update',
                message: error.message,
                streamerId,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBankDonationTotalWidget(streamerId, format = 'html', theme = 'dark', showStats = 'false', res) {
        try {
            const showStatsBool = showStats === 'true';
            if (format === 'json') {
                const stats = showStatsBool
                    ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
                    : await this.bankDonationTotalService.getTotalBankDonations(streamerId);
                return res.json({
                    success: true,
                    streamerId,
                    data: stats,
                });
            }
            const stats = showStatsBool
                ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
                : await this.bankDonationTotalService.getTotalBankDonations(streamerId);
            const html = this.generateWidgetHtml(streamerId, stats, theme, showStatsBool);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return res.send(html);
        }
        catch (error) {
            this.logger.error(`Failed to generate bank donation total widget for streamer ${streamerId}:`, error);
            const isBSONError = error.message && error.message.includes('BSONError');
            const errorMessage = isBSONError
                ? 'Invalid streamer ID format. Please check the streamer ID and try again.'
                : error.message || 'Failed to generate widget';
            if (format === 'json') {
                return res.status(400).json({
                    success: false,
                    error: isBSONError ? 'Invalid Streamer ID' : 'Failed to generate widget',
                    message: errorMessage,
                    streamerId,
                });
            }
            const errorHtml = this.generateErrorHtml(streamerId, errorMessage);
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(errorHtml);
        }
    }
    generateWidgetHtml(streamerId, stats, theme = 'dark', showStats = false) {
        const totalAmount = this.bankDonationTotalService.formatCurrency(stats.totalAmount, stats.currency);
        const themeStyles = this.getThemeStyles(theme);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Donation Total Widget</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            overflow: hidden;
        }
        
        .widget-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .total-card {
            background: ${themeStyles.cardBackground};
            border: ${themeStyles.border};
            padding: 24px;
            box-shadow: ${themeStyles.shadow};
            text-align: center;
            min-width: 300px;
            max-width: 500px;
        }
        
        .title {
            font-size: 18px;
            font-weight: 600;
            color: ${themeStyles.primaryColor};
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-shadow: ${themeStyles.textShadow};
        }
        
        .amount {
            font-size: 36px;
            font-weight: 700;
            color: ${themeStyles.primaryColor};
            margin-bottom: 8px;
            text-shadow: ${themeStyles.textShadow};
            transition: all 0.5s ease;
        }
        
        .amount.animating {
            transform: translateY(10px);
            opacity: 0.8;
            animation: numberGlow 2s ease-in-out;
        }
        
        @keyframes numberGlow {
            0% {
                text-shadow: ${themeStyles.textShadow}, 0 0 10px rgba(59, 130, 246, 0.3);
            }
            50% {
                text-shadow: ${themeStyles.textShadow}, 0 0 20px rgba(59, 130, 246, 0.6);
            }
            100% {
                text-shadow: ${themeStyles.textShadow}, 0 0 10px rgba(59, 130, 246, 0.3);
            }
        }
        
        @keyframes slideUpFade {
            0% {
                transform: translateY(20px);
                opacity: 0.7;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .currency {
            font-size: 14px;
            color: ${themeStyles.textSecondary};
            margin-bottom: 16px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-top: 20px;
        }
        
        .stat-item {
            background: ${themeStyles.statBackground};
            padding: 12px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: ${themeStyles.primaryColor};
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 12px;
            color: ${themeStyles.textSecondary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid ${themeStyles.borderColor};
            border-top: 3px solid ${themeStyles.primaryColor};
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="total-card">
            <div class="title">TỔNG DONATE</div>
            <div class="amount" id="totalAmount">${totalAmount}</div>
            <div class="currency">${stats.currency}</div>
            
            ${showStats ? `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.transactionCount}</div>
                        <div class="stat-label">Transactions</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.bankDonationTotalService.formatCurrency(stats.averageDonation || 0, stats.currency)}</div>
                        <div class="stat-label">Average</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.bankDonationTotalService.formatCurrency(stats.todayDonations || 0, stats.currency)}</div>
                        <div class="stat-label">Today</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.bankDonationTotalService.formatCurrency(stats.thisWeekDonations || 0, stats.currency)}</div>
                        <div class="stat-label">This Week</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.bankDonationTotalService.formatCurrency(stats.thisMonthDonations || 0, stats.currency)}</div>
                        <div class="stat-label">This Month</div>
                    </div>
                </div>
            ` : ''}
            
        </div>
    </div>
    
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
        let currentAmount = ${stats.totalAmount};
        let isAnimating = false;
        let socket = null;
        const streamerId = '${streamerId}';
        
        // Running number animation function
        function animateToNewAmount(newAmount, duration = 2000) {
            if (isAnimating || newAmount === currentAmount) return;
            
            isAnimating = true;
            const startAmount = currentAmount;
            const difference = newAmount - startAmount;
            const startTime = performance.now();
            
            const amountElement = document.getElementById('totalAmount');
            amountElement.classList.add('animating');
            
            function updateAmount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                
                const currentValue = startAmount + (difference * easeOutCubic);
                const formattedValue = formatCurrency(Math.round(currentValue), '${stats.currency}');
                amountElement.textContent = formattedValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateAmount);
                } else {
                    amountElement.textContent = formatCurrency(newAmount, '${stats.currency}');
                    currentAmount = newAmount;
                    isAnimating = false;
                    amountElement.classList.remove('animating');
                }
            }
            
            requestAnimationFrame(updateAmount);
        }
        
        // Format currency function
        function formatCurrency(amount, currency = 'VND') {
            if (currency === 'VND') {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            }
            
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        }
        
        // Initialize WebSocket connection
        function initializeWebSocket() {
            try {
                const host = window.location.host;
                
                console.log('Current page protocol:', window.location.protocol);
                console.log('Forcing HTTP protocol for WebSocket');
                
                // Force HTTP protocol - server only supports HTTP
                connectWebSocket(\`http://\${host}/obs-widget\`);
                
            } catch (error) {
                console.error('Failed to initialize WebSocket:', error);
                // Fallback to HTTP polling if WebSocket fails
                startHttpPolling();
            }
        }
        
        function connectWebSocket(wsUrl) {
            console.log('Connecting to WebSocket:', wsUrl);
            
            socket = io(wsUrl, {
                transports: ['polling'],
                upgrade: false,
                rememberUpgrade: false,
                forceNew: true,
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            
            socket.on('connect', () => {
                console.log('WebSocket connected');
                // Stop HTTP polling since WebSocket is working
                stopHttpPolling();
                // Join the bank total room for this streamer
                socket.emit('joinBankTotalRoom', { streamerId: streamerId });
            });
            
            socket.on('joinedBankTotalRoom', (data) => {
                console.log('Joined bank total room:', data);
            });
            
            socket.on('bankDonationTotalUpdate', (data) => {
                console.log('Received bank donation total update:', data);
                if (data.totalAmount !== currentAmount) {
                    animateToNewAmount(data.totalAmount);
                }
            });
            
            socket.on('disconnect', () => {
                console.log('WebSocket disconnected');
            });
            
            socket.on('error', (error) => {
                console.error('WebSocket error:', error);
                // If WebSocket fails, fallback to HTTP polling
                startHttpPolling();
            });
            
            socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                // If connection fails, fallback to HTTP polling
                startHttpPolling();
            });
            
            // Timeout fallback
            setTimeout(() => {
                if (!socket || !socket.connected) {
                    console.log('WebSocket connection timeout, falling back to HTTP polling');
                    startHttpPolling();
                }
            }, 10000);
        }
        
        // Fallback HTTP polling (if WebSocket fails)
        let httpPollingInterval = null;
        
        function startHttpPolling() {
            if (httpPollingInterval) {
                console.log('HTTP polling already active');
                return;
            }
            
            console.log('Starting HTTP polling fallback');
            
            httpPollingInterval = setInterval(async () => {
                try {
                    const host = window.location.host;
                    const pathname = window.location.pathname;
                    const search = window.location.search;
                    
                    // Force HTTP protocol - server only supports HTTP
                    let refreshUrl = \`http://\${host}\${pathname}\`;
                    
                    if (search) {
                        const params = new URLSearchParams(search);
                        params.delete('format');
                        const queryString = params.toString();
                        if (queryString) {
                            refreshUrl += '?' + queryString;
                        }
                    }
                    
                    refreshUrl += (refreshUrl.includes('?') ? '&' : '?') + 'format=json';
                    
                    console.log('HTTP polling from:', refreshUrl);
                    
                    const response = await fetch(refreshUrl);
                    const data = await response.json();
                    
                    if (data.success && data.data.totalAmount !== currentAmount) {
                        console.log('Amount changed via HTTP polling:', data.data.totalAmount);
                        animateToNewAmount(data.data.totalAmount);
                    }
                } catch (error) {
                    console.error('HTTP polling failed:', error);
                }
            }, 30000);
        }
        
        function stopHttpPolling() {
            if (httpPollingInterval) {
                clearInterval(httpPollingInterval);
                httpPollingInterval = null;
                console.log('HTTP polling stopped');
            }
        }
        
        // Initialize WebSocket when page loads
        document.addEventListener('DOMContentLoaded', () => {
            // Check if we're on HTTPS and server only supports HTTP
            if (window.location.protocol === 'https:') {
                console.log('HTTPS page detected, skipping WebSocket due to mixed content policy');
                console.log('Using HTTP polling only for real-time updates');
                startHttpPolling();
            } else {
                initializeWebSocket();
            }
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (socket) {
                socket.disconnect();
            }
        });
    </script>
</body>
</html>`;
    }
    generateErrorHtml(streamerId, errorMessage) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Donation Total Widget - Error</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .error-container {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            color: #ef4444;
            max-width: 400px;
        }
        .error-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .error-message {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-title">Widget Error</div>
        <div class="error-message">${errorMessage}</div>
    </div>
</body>
</html>`;
    }
    getThemeStyles(theme) {
        const themes = {
            dark: {
                cardBackground: 'transparent',
                border: 'none',
                shadow: 'none',
                hoverShadow: 'none',
                primaryColor: '#ffffff',
                textPrimary: '#ffffff',
                textSecondary: '#d1d5db',
                statBackground: 'transparent',
                borderColor: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            },
            light: {
                cardBackground: 'transparent',
                border: 'none',
                shadow: 'none',
                hoverShadow: 'none',
                primaryColor: '#000000',
                textPrimary: '#000000',
                textSecondary: '#4b5563',
                statBackground: 'transparent',
                borderColor: 'transparent',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            },
            transparent: {
                cardBackground: 'transparent',
                border: 'none',
                shadow: 'none',
                hoverShadow: 'none',
                primaryColor: '#ffffff',
                textPrimary: '#ffffff',
                textSecondary: '#d1d5db',
                statBackground: 'transparent',
                borderColor: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            },
        };
        return themes[theme] || themes.dark;
    }
};
exports.BankDonationTotalController = BankDonationTotalController;
__decorate([
    (0, common_1.Get)(':streamerId/trigger-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger WebSocket update for bank donation total widget' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Update triggered successfully' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankDonationTotalController.prototype, "triggerBankDonationTotalUpdate", null);
__decorate([
    (0, common_1.Get)(':streamerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bank donation total widget for OBS' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer ID' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, description: 'Response format (html, json)', enum: ['html', 'json'] }),
    (0, swagger_1.ApiQuery)({ name: 'theme', required: false, description: 'Widget theme', enum: ['dark', 'light', 'transparent'] }),
    (0, swagger_1.ApiQuery)({ name: 'showStats', required: false, description: 'Show additional statistics', type: 'boolean' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Widget HTML or JSON data' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('theme')),
    __param(3, (0, common_1.Query)('showStats')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], BankDonationTotalController.prototype, "getBankDonationTotalWidget", null);
exports.BankDonationTotalController = BankDonationTotalController = __decorate([
    (0, swagger_1.ApiTags)('Bank Donation Total Widget'),
    (0, common_1.Controller)('widget-public/bank-total'),
    __metadata("design:paramtypes", [bank_donation_total_service_1.BankDonationTotalService,
        obs_widget_gateway_1.OBSWidgetGateway])
], BankDonationTotalController);
//# sourceMappingURL=bank-donation-total.controller.js.map