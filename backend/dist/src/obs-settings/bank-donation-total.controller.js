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
    async getBankDonationTotalWidget(streamerId, format = 'html', theme = 'dark', showStats = 'false', staticMode = 'false', req, res) {
        try {
            const showStatsBool = showStats === 'true';
            if (format === 'json') {
                const stats = showStatsBool
                    ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
                    : await this.bankDonationTotalService.getTotalBankDonations(streamerId);
                const responseData = {
                    success: true,
                    streamerId,
                    data: stats,
                };
                const callback = req.query.callback;
                if (callback) {
                    res.setHeader('Content-Type', 'application/javascript');
                    return res.send(`${callback}(${JSON.stringify(responseData)});`);
                }
                return res.json(responseData);
            }
            const stats = showStatsBool
                ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
                : await this.bankDonationTotalService.getTotalBankDonations(streamerId);
            const isStatic = staticMode === 'true';
            const html = this.generateWidgetHtml(streamerId, stats, theme, showStatsBool, isStatic);
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
    generateWidgetHtml(streamerId, stats, theme = 'dark', showStats = false, isStatic = false) {
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
    
    <script>
        let currentAmount = ${stats.totalAmount};
        let isAnimating = false;
        let isInitialized = false;
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
            // Check if we're on HTTPS - if so, disable WebSocket since server only supports HTTP
            if (window.location.protocol === 'https:' || window.location.href.includes('https://')) {
                console.log('HTTPS detected - WebSocket disabled since server only supports HTTP');
                console.log('Widget will show static data. For real-time updates:');
                console.log('1. Access the widget via HTTP: http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e');
                console.log('2. Use HTTP URL in OBS Browser Source');
                
                // Add visual indicator that this is static data
                const amountElement = document.getElementById('totalAmount');
                if (amountElement) {
                    amountElement.style.opacity = '0.7';
                    amountElement.title = 'Static data - server only supports HTTP';
                }
                
                // Add a notice to the page
                const notice = document.createElement('div');
                notice.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                notice.textContent = 'Use HTTP for real-time updates';
                document.body.appendChild(notice);
                
                return;
            }
            
            // Only load Socket.IO if we're on HTTP
            const script = document.createElement('script');
            script.src = 'http://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = function() {
                // NUCLEAR OPTION: COMPLETELY OVERRIDE SOCKET.IO TO FORCE HTTP
                if (window.io) {
                    console.log('🔧 NUCLEAR OPTION: Completely overriding Socket.IO to force HTTP');
                    
                    // Store original Socket.IO
                    const originalIO = window.io;
                    
                    // Create a custom Socket.IO client that ONLY uses HTTP
                    window.io = function(url, options) {
                        console.log('🚀 Custom Socket.IO client called with URL:', url);
                        
                        // FORCE HTTP PROTOCOL - NO EXCEPTIONS
                        if (typeof url === 'string') {
                            if (url.includes('https://')) {
                                url = url.replace('https://', 'http://');
                                console.log('🔧 FORCED HTTPS → HTTP:', url);
                            }
                            if (!url.startsWith('http://')) {
                                url = 'http://' + url.replace(/^https?:\/\//, '');
                                console.log('🔧 ENFORCED HTTP PROTOCOL:', url);
                            }
                        }
                        
                        // FORCE HTTP OPTIONS
                        const httpOptions = {
                            ...options,
                            secure: false,
                            rejectUnauthorized: false,
                            transports: ['polling'],
                            upgrade: false,
                            rememberUpgrade: false,
                            forceNew: true,
                            timeout: 5000,
                            reconnection: true,
                            reconnectionAttempts: 5,
                            reconnectionDelay: 1000,
                            autoConnect: true,
                            multiplex: false,
                            allowEIO3: true,
                            forceBase64: false,
                            withCredentials: false
                        };
                        
                        console.log('🔧 Custom Socket.IO options:', httpOptions);
                        
                        // Create the socket with forced HTTP
                        const socket = originalIO(url, httpOptions);
                        
                        // Override socket's internal methods to prevent HTTPS
                        if (socket && socket.io) {
                            const originalEngine = socket.io.engine;
                            if (originalEngine) {
                                // Override engine's URI
                                Object.defineProperty(originalEngine, 'uri', {
                                    get: function() {
                                        const uri = this._uri || originalEngine.uri;
                                        if (typeof uri === 'string' && uri.includes('https://')) {
                                            const httpUri = uri.replace('https://', 'http://');
                                            console.log('🔧 Engine URI forced to HTTP:', httpUri);
                                            return httpUri;
                                        }
                                        return uri;
                                    },
                                    set: function(value) {
                                        if (typeof value === 'string' && value.includes('https://')) {
                                            value = value.replace('https://', 'http://');
                                            console.log('🔧 Engine URI set to HTTP:', value);
                                        }
                                        this._uri = value;
                                    }
                                });
                            }
                        }
                        
                        return socket;
                    };
                    
                    // Copy all static properties from original Socket.IO
                    Object.setPrototypeOf(window.io, originalIO);
                    Object.assign(window.io, originalIO);
                    
                    console.log('✅ Custom Socket.IO client ready - HTTP ONLY');
                }
                // OVERRIDE SOCKET.IO CLIENT INTERNALS IMMEDIATELY AFTER LOAD
                if (window.io && window.io.Manager) {
                    // Override the Manager's url method
                    const originalManager = window.io.Manager;
                    const originalManagerProto = originalManager.prototype;
                    
                    if (originalManagerProto && originalManagerProto.url) {
                        const originalUrl = originalManagerProto.url;
                        originalManagerProto.url = function() {
                            const url = originalUrl.call(this);
                            console.log('Manager.url() returned:', url);
                            
                            if (typeof url === 'string' && url.includes('https://')) {
                                const httpUrl = url.replace('https://', 'http://');
                                console.log('Manager.url() forced to HTTP:', httpUrl);
                                return httpUrl;
                            }
                            
                            return url;
                        };
                    }
                    
                    // Override the Manager's uri method
                    if (originalManagerProto && originalManagerProto.uri) {
                        const originalUri = originalManagerProto.uri;
                        originalManagerProto.uri = function() {
                            const uri = originalUri.call(this);
                            console.log('Manager.uri() returned:', uri);
                            
                            if (typeof uri === 'string' && uri.includes('https://')) {
                                const httpUri = uri.replace('https://', 'http://');
                                console.log('Manager.uri() forced to HTTP:', httpUri);
                                return httpUri;
                            }
                            
                            return uri;
                        };
                    }
                    
                    // Override the Manager's engine property
                    if (originalManagerProto && originalManagerProto.engine) {
                        const originalEngine = originalManagerProto.engine;
                        Object.defineProperty(originalManagerProto, 'engine', {
                            get: function() {
                                const engine = originalEngine;
                                if (engine && engine.uri && typeof engine.uri === 'string' && engine.uri.includes('https://')) {
                                    engine.uri = engine.uri.replace('https://', 'http://');
                                    console.log('Engine URI forced to HTTP:', engine.uri);
                                }
                                return engine;
                            },
                            set: function(value) {
                                if (value && value.uri && typeof value.uri === 'string' && value.uri.includes('https://')) {
                                    value.uri = value.uri.replace('https://', 'http://');
                                    console.log('Engine URI set to HTTP:', value.uri);
                                }
                                originalEngine = value;
                            }
                        });
                    }
                }
                // Double-check protocol before attempting connection
                if (window.location.protocol === 'https:') {
                    console.error('HTTPS detected in Socket.IO loader - aborting WebSocket connection');
                    return;
                }
                try {
                    const host = window.location.host;
                    const protocol = window.location.protocol;
                    
                    console.log('Connecting to WebSocket for real-time bank donation updates');
                    console.log('Current protocol:', protocol);
                    console.log('Current host:', host);
                    
                    // AGGRESSIVE PROTOCOL VALIDATION
                    if (protocol !== 'http:') {
                        console.error('PROTOCOL ERROR: Only HTTP is supported, got:', protocol);
                        return;
                    }
                    
                    // Force HTTP protocol for WebSocket - server only supports HTTP
                    const socketUrl = \`http://\${host}/obs-widget\`;
                    console.log('Socket URL:', socketUrl);
                    
                    // ADDITIONAL: Force HTTP in the host variable itself
                    const httpHost = host.replace('https://', 'http://');
                    const httpSocketUrl = \`http://\${httpHost}/obs-widget\`;
                    console.log('HTTP Socket URL:', httpSocketUrl);
                    
                    // VALIDATE URL BEFORE CONNECTION
                    if (socketUrl.includes('https://')) {
                        console.error('URL VALIDATION ERROR: HTTPS detected in socket URL:', socketUrl);
                        return;
                    }
                    
                    // INTERCEPT AND REDIRECT ANY HTTPS REQUESTS TO HTTP
                    const originalFetch = window.fetch;
                    const originalXHR = window.XMLHttpRequest;
                    
                    // Override fetch to redirect HTTPS to HTTP
                    window.fetch = function(...args) {
                        let url = args[0];
                        if (typeof url === 'string' && url.includes('https://')) {
                            console.log('REDIRECTING HTTPS FETCH REQUEST:', url);
                            url = url.replace('https://', 'http://');
                            console.log('REDIRECTED TO HTTP:', url);
                            args[0] = url;
                        }
                        return originalFetch.apply(this, args);
                    };
                    
                    // Override XMLHttpRequest to redirect HTTPS to HTTP
                    const OriginalXHR = window.XMLHttpRequest;
                    window.XMLHttpRequest = function() {
                        const xhr = new OriginalXHR();
                        const originalOpen = xhr.open;
                        xhr.open = function(method, url, ...args) {
                            if (typeof url === 'string' && url.includes('https://')) {
                                console.log('REDIRECTING HTTPS XHR REQUEST:', url);
                                url = url.replace('https://', 'http://');
                                console.log('REDIRECTED TO HTTP:', url);
                            }
                            return originalOpen.apply(this, [method, url, ...args]);
                        };
                        return xhr;
                    };
                    
                    // OVERRIDE SOCKET.IO INTERNAL URL GENERATION
                    const originalIO = window.io;
                    window.io = function(url, options) {
                        console.log('Socket.IO called with URL:', url);
                        
                        // Force HTTP protocol in the URL
                        if (typeof url === 'string' && url.includes('https://')) {
                            url = url.replace('https://', 'http://');
                            console.log('Socket.IO URL forced to HTTP:', url);
                        }
                        
                        // Force HTTP in options
                        if (options) {
                            options.secure = false;
                            options.rejectUnauthorized = false;
                        }
                        
                        return originalIO.call(this, url, options);
                    };
                    
                    // NUCLEAR OPTION: Use custom Socket.IO client with forced HTTP
                    console.log('🚀 Creating Socket.IO connection with NUCLEAR HTTP enforcement');
                    
                    // FINAL SAFETY CHECK: Ensure URL is HTTP
                    const finalSocketUrl = httpSocketUrl.replace('https://', 'http://');
                    console.log('🔧 Final Socket URL (HTTP enforced):', finalSocketUrl);
                    
                    // NUCLEAR OPTION: Create a completely custom HTTP-only Socket.IO client
                    const customIO = function(url, options) {
                        console.log('🚀 Custom HTTP-only Socket.IO client called');
                        
                        // FORCE HTTP PROTOCOL - NO EXCEPTIONS
                        if (typeof url === 'string') {
                            if (url.includes('https://')) {
                                url = url.replace('https://', 'http://');
                                console.log('🔧 Custom client forced HTTPS → HTTP:', url);
                            }
                            if (!url.startsWith('http://')) {
                                url = 'http://' + url.replace(/^https?:\/\//, '');
                                console.log('🔧 Custom client enforced HTTP protocol:', url);
                            }
                        }
                        
                        // FORCE HTTP OPTIONS
                        const httpOptions = {
                            ...options,
                            secure: false,
                            rejectUnauthorized: false,
                            transports: ['polling'],
                            upgrade: false,
                            rememberUpgrade: false,
                            forceNew: true,
                            timeout: 5000,
                            reconnection: true,
                            reconnectionAttempts: 5,
                            reconnectionDelay: 1000,
                            autoConnect: true,
                            multiplex: false,
                            allowEIO3: true,
                            forceBase64: false,
                            withCredentials: false
                        };
                        
                        console.log('🔧 Custom client options:', httpOptions);
                        
                        // Use the original Socket.IO with forced HTTP
                        return originalIO(url, httpOptions);
                    };
                    
                    // Copy all static properties
                    Object.setPrototypeOf(customIO, originalIO);
                    Object.assign(customIO, originalIO);
                    
                    socket = customIO(finalSocketUrl, {
                        // CRITICAL: Only use polling transport to prevent WebSocket upgrade attempts
                        transports: ['polling'],
                        upgrade: false,
                        rememberUpgrade: false,
                        forceNew: true,
                        timeout: 5000,
                        reconnection: true,
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        // Force HTTP protocol explicitly
                        secure: false,
                        rejectUnauthorized: false,
                        // Additional options to prevent HTTPS upgrade
                        autoConnect: true,
                        multiplex: false,
                        // CRITICAL: Disable all WebSocket-related features
                        allowEIO3: true,
                        // Force polling-only mode
                        forceBase64: false,
                        // Prevent any protocol upgrades
                        withCredentials: false
                    });
                    
                    // ADDITIONAL: Override socket's internal URL generation
                    if (socket && socket.io && socket.io.engine) {
                        const engine = socket.io.engine;
                        
                        // Override engine's URI property
                        Object.defineProperty(engine, 'uri', {
                            get: function() {
                                const uri = this._uri || engine.uri;
                                if (typeof uri === 'string' && uri.includes('https://')) {
                                    const httpUri = uri.replace('https://', 'http://');
                                    console.log('🔧 Socket Engine URI forced to HTTP:', httpUri);
                                    return httpUri;
                                }
                                return uri;
                            },
                            set: function(value) {
                                if (typeof value === 'string' && value.includes('https://')) {
                                    value = value.replace('https://', 'http://');
                                    console.log('🔧 Socket Engine URI set to HTTP:', value);
                                }
                                this._uri = value;
                            }
                        });
                        
                        // Override engine's URL property
                        Object.defineProperty(engine, 'url', {
                            get: function() {
                                const url = this._url || engine.url;
                                if (typeof url === 'string' && url.includes('https://')) {
                                    const httpUrl = url.replace('https://', 'http://');
                                    console.log('🔧 Socket Engine URL forced to HTTP:', httpUrl);
                                    return httpUrl;
                                }
                                return url;
                            },
                            set: function(value) {
                                if (typeof value === 'string' && value.includes('https://')) {
                                    value = value.replace('https://', 'http://');
                                    console.log('🔧 Socket Engine URL set to HTTP:', value);
                                }
                                this._url = value;
                            }
                        });
                    }
                    
                    // Restore original io function after connection attempt
                    setTimeout(() => {
                        window.io = originalIO;
                    }, 1000);
                    
                    // OVERRIDE ENGINE.IO CLIENT URL GENERATION (MORE AGGRESSIVE)
                    if (window.io && window.io.Manager) {
                        const originalManager = window.io.Manager;
                        window.io.Manager = function(uri, opts) {
                            console.log('Engine.IO Manager called with URI:', uri);
                            
                            // Force HTTP protocol
                            if (typeof uri === 'string' && uri.includes('https://')) {
                                uri = uri.replace('https://', 'http://');
                                console.log('Engine.IO Manager URI forced to HTTP:', uri);
                            }
                            
                            // Force HTTP options
                            if (opts) {
                                opts.secure = false;
                                opts.rejectUnauthorized = false;
                            }
                            
                            return new originalManager(uri, opts);
                        };
                        
                        // Copy static properties
                        Object.setPrototypeOf(window.io.Manager, originalManager);
                        Object.assign(window.io.Manager, originalManager);
                    }
                    
                    // OVERRIDE SOCKET.IO CLIENT'S INTERNAL URL PARSING
                    if (window.io && window.io.Manager && window.io.Manager.prototype) {
                        const managerProto = window.io.Manager.prototype;
                        
                        // Override the _parse method if it exists
                        if (managerProto._parse) {
                            const originalParse = managerProto._parse;
                            managerProto._parse = function(uri) {
                                console.log('Manager._parse called with URI:', uri);
                                
                                if (typeof uri === 'string' && uri.includes('https://')) {
                                    uri = uri.replace('https://', 'http://');
                                    console.log('Manager._parse URI forced to HTTP:', uri);
                                }
                                
                                return originalParse.call(this, uri);
                            };
                        }
                        
                        // Override the _onopen method if it exists
                        if (managerProto._onopen) {
                            const originalOnopen = managerProto._onopen;
                            managerProto._onopen = function() {
                                console.log('Manager._onopen called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnopen.call(this);
                            };
                        }
                        
                        // Override the _onconnect method if it exists
                        if (managerProto._onconnect) {
                            const originalOnconnect = managerProto._onconnect;
                            managerProto._onconnect = function() {
                                console.log('Manager._onconnect called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP in _onconnect:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnconnect.call(this);
                            };
                        }
                        
                        // Override the _onreconnect method if it exists
                        if (managerProto._onreconnect) {
                            const originalOnreconnect = managerProto._onreconnect;
                            managerProto._onreconnect = function() {
                                console.log('Manager._onreconnect called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP in _onreconnect:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnreconnect.call(this);
                            };
                        }
                        
                        // Override the _onreconnect_attempt method if it exists
                        if (managerProto._onreconnect_attempt) {
                            const originalOnreconnectAttempt = managerProto._onreconnect_attempt;
                            managerProto._onreconnect_attempt = function() {
                                console.log('Manager._onreconnect_attempt called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP in _onreconnect_attempt:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnreconnectAttempt.call(this);
                            };
                        }
                        
                        // Override the _onreconnect_error method if it exists
                        if (managerProto._onreconnect_error) {
                            const originalOnreconnectError = managerProto._onreconnect_error;
                            managerProto._onreconnect_error = function() {
                                console.log('Manager._onreconnect_error called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP in _onreconnect_error:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnreconnectError.call(this);
                            };
                        }
                        
                        // Override the _onreconnect_failed method if it exists
                        if (managerProto._onreconnect_failed) {
                            const originalOnreconnectFailed = managerProto._onreconnect_failed;
                            managerProto._onreconnect_failed = function() {
                                console.log('Manager._onreconnect_failed called');
                                
                                // Force HTTP in the transport
                                if (this.engine && this.engine.uri) {
                                    const uri = this.engine.uri;
                                    if (typeof uri === 'string' && uri.includes('https://')) {
                                        this.engine.uri = uri.replace('https://', 'http://');
                                        console.log('Engine URI forced to HTTP in _onreconnect_failed:', this.engine.uri);
                                    }
                                }
                                
                                return originalOnreconnectFailed.call(this);
                            };
                        }
                    }
                    
                    socket.on('connect', () => {
                        console.log('WebSocket connected for bank donation updates');
                        
                        // Restore original methods on successful connection
                        window.fetch = originalFetch;
                        window.XMLHttpRequest = originalXHR;
                        
                        // Join the bank total room for this streamer
                        socket.emit('joinBankTotalRoom', { streamerId: streamerId });
                    });
                    
                    socket.on('joinedBankTotalRoom', (data) => {
                        console.log('Joined bank total room:', data);
                    });
                    
                    socket.on('bankDonationTotalUpdate', (data) => {
                        console.log('Received bank donation total update:', data);
                        if (data.totalAmount !== currentAmount) {
                            console.log('Updating total amount from', currentAmount, 'to', data.totalAmount);
                            animateToNewAmount(data.totalAmount);
                        }
                    });
                    
                    socket.on('disconnect', () => {
                        console.log('WebSocket disconnected');
                    });
                    
                    socket.on('error', (error) => {
                        console.error('WebSocket error:', error);
                    });
                    
                    socket.on('connect_error', (error) => {
                        console.error('WebSocket connection error:', error);
                        
                        // If we get SSL/TLS errors, disable WebSocket completely
                        if (error.message && (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('HTTPS'))) {
                            console.error('SSL/TLS error detected - disabling WebSocket for this session');
                            socket.disconnect();
                            socket = null;
                            
                            // Restore original methods
                            window.fetch = originalFetch;
                            window.XMLHttpRequest = originalXHR;
                            
                            // Add visual indicator that WebSocket is disabled
                            const amountElement = document.getElementById('totalAmount');
                            if (amountElement) {
                                amountElement.style.opacity = '0.7';
                                amountElement.title = 'WebSocket disabled due to SSL/TLS error - using static data';
                            }
                            
                            // Add a notice to the page
                            const notice = document.createElement('div');
                            notice.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                            notice.textContent = 'WebSocket disabled - SSL/TLS error';
                            document.body.appendChild(notice);
                        }
                    });
                    
                } catch (error) {
                    console.error('Failed to initialize WebSocket:', error);
                }
            };
            script.onerror = function() {
                console.error('Failed to load Socket.IO library');
            };
            document.head.appendChild(script);
        }
        
        // Initialize connection when page loads
        document.addEventListener('DOMContentLoaded', () => {
            if (isInitialized) {
                console.log('Already initialized, skipping');
                return;
            }
            
            isInitialized = true;
            
            // Check if static mode is enabled
            if (${isStatic}) {
                console.log('Static mode enabled - WebSocket disabled');
                console.log('Widget will show static data only');
                
                // Add visual indicator that this is static data
                const amountElement = document.getElementById('totalAmount');
                if (amountElement) {
                    amountElement.style.opacity = '0.8';
                    amountElement.title = 'Static mode - no real-time updates';
                }
                
                // Add a notice to the page
                const notice = document.createElement('div');
                notice.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255, 165, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                notice.textContent = 'Static mode - no WebSocket';
                document.body.appendChild(notice);
                
                return;
            }
            
            // IMMEDIATE HTTPS CHECK - if we're on HTTPS, don't initialize WebSocket at all
            if (window.location.protocol === 'https:' || window.location.href.includes('https://')) {
                console.log('HTTPS detected - WebSocket disabled since server only supports HTTP');
                console.log('Widget will show static data. For real-time updates:');
                console.log('1. Access the widget via HTTP: http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e');
                console.log('2. Use HTTP URL in OBS Browser Source');
                
                // Add visual indicator that this is static data
                const amountElement = document.getElementById('totalAmount');
                if (amountElement) {
                    amountElement.style.opacity = '0.7';
                    amountElement.title = 'Static data - server only supports HTTP';
                }
                
                // Add a notice to the page
                const notice = document.createElement('div');
                notice.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                notice.textContent = 'Use HTTP for real-time updates';
                document.body.appendChild(notice);
                
                return;
            }
            
            console.log('HTTP page detected - initializing WebSocket for real-time bank donation updates');
            initializeWebSocket();
            
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
    (0, swagger_1.ApiQuery)({ name: 'static', required: false, description: 'Force static mode (no WebSocket)', type: 'boolean' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Widget HTML or JSON data' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('theme')),
    __param(3, (0, common_1.Query)('showStats')),
    __param(4, (0, common_1.Query)('static')),
    __param(5, (0, common_1.Req)()),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], BankDonationTotalController.prototype, "getBankDonationTotalWidget", null);
exports.BankDonationTotalController = BankDonationTotalController = __decorate([
    (0, swagger_1.ApiTags)('Bank Donation Total Widget'),
    (0, common_1.Controller)('widget-public/bank-total'),
    __metadata("design:paramtypes", [bank_donation_total_service_1.BankDonationTotalService,
        obs_widget_gateway_1.OBSWidgetGateway])
], BankDonationTotalController);
//# sourceMappingURL=bank-donation-total.controller.js.map