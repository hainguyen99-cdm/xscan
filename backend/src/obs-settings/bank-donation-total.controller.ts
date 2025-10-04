import { Controller, Get, Param, Query, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { BankDonationTotalService } from './bank-donation-total.service';
import { OBSWidgetGateway } from './obs-widget.gateway';

@ApiTags('Bank Donation Total Widget')
@Controller('widget-public/bank-total')
export class BankDonationTotalController {
  constructor(
    private readonly bankDonationTotalService: BankDonationTotalService,
    private readonly obsWidgetGateway: OBSWidgetGateway,
  ) {}

  @Get(':streamerId/trigger-update')
  @ApiOperation({ summary: 'Trigger WebSocket update for bank donation total widget' })
  @ApiParam({ name: 'streamerId', description: 'Streamer ID' })
  @ApiResponse({ status: 200, description: 'Update triggered successfully' })
  async triggerBankDonationTotalUpdate(@Param('streamerId') streamerId: string) {
    try {
      await this.bankDonationTotalService.broadcastBankDonationTotalUpdate(streamerId);
      return {
        success: true,
        message: 'Bank donation total update triggered',
        streamerId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to trigger bank donation total update for streamer ${streamerId}:`, error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to trigger update',
          message: error.message,
          streamerId,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':streamerId')
  @ApiOperation({ summary: 'Get bank donation total widget for OBS' })
  @ApiParam({ name: 'streamerId', description: 'Streamer ID' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (html, json)', enum: ['html', 'json'] })
  @ApiQuery({ name: 'theme', required: false, description: 'Widget theme', enum: ['dark', 'light', 'transparent'] })
  @ApiQuery({ name: 'showStats', required: false, description: 'Show additional statistics', type: 'boolean' })
  @ApiQuery({ name: 'static', required: false, description: 'Force static mode (no WebSocket)', type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Widget HTML or JSON data' })
  async getBankDonationTotalWidget(
    @Param('streamerId') streamerId: string,
    @Query('format') format: string = 'html',
    @Query('theme') theme: string = 'dark',
    @Query('showStats') showStats: string = 'false',
    @Query('static') staticMode: string = 'false',
    @Req() req: Request,
    @Res() res: Response,
  ) {
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
        
        // Check if this is a JSONP request
        const callback = req.query.callback as string;
        if (callback) {
          res.setHeader('Content-Type', 'application/javascript');
          return res.send(`${callback}(${JSON.stringify(responseData)});`);
        }
        
        return res.json(responseData);
      }

      // Generate HTML widget
      const stats = showStatsBool 
        ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
        : await this.bankDonationTotalService.getTotalBankDonations(streamerId);

      const isStatic = staticMode === 'true';
      const html = this.generateWidgetHtml(streamerId, stats, theme, showStatsBool, isStatic);
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: http: https:");
      
      return res.send(html);
    } catch (error) {
      this.logger.error(`Failed to generate bank donation total widget for streamer ${streamerId}:`, error);
      
      // Check if it's a BSON validation error
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

      // Return error HTML
      const errorHtml = this.generateErrorHtml(streamerId, errorMessage);
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(errorHtml);
    }
  }

  private generateWidgetHtml(
    streamerId: string,
    stats: any,
    theme: string = 'dark',
    showStats: boolean = false,
    isStatic: boolean = false,
  ): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
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
        <div class="total-card;">
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
            // IMMEDIATE HTTPS CHECK - if we're on HTTPS, disable WebSocket completely
            if (window.location.protocol === 'https:' || window.location.href.includes('https://')) {
                console.error('HTTPS DETECTED - WebSocket disabled since server only supports HTTP');
                console.error('Widget will show static data. For real-time updates:');
                console.error('1. Access the widget via HTTP: http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e');
                console.error('2. Use HTTP URL in OBS Browser Source');
                
                // Add visual indicator that this is static data
                const amountElement = document.getElementById('totalAmount');
                if (amountElement) {
                    amountElement.style.opacity = '0.7';
                    amountElement.title = 'Static data - server only supports HTTP';
                }
                
                // Add a notice to the page
                const notice = document.createElement('div');
                notice.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                notice.textContent = 'HTTPS detected - Use HTTP for real-time updates';
                document.body.appendChild(notice);
                
                return;
            }
            
            console.log('HTTP page detected - initializing WebSocket for real-time bank donation updates');
            
            // Only load Socket.IO if we're on HTTP
            const script = document.createElement('script');
            script.src = '${baseUrl}/socket.io/socket.io.js';
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
                        if (typeof url === 'string' && url.includes('https://')) {
                            url = url.replace('https://', 'http://');
                            console.log('🔧 FORCED HTTPS → HTTP:', url);
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
                        
                        // AGGRESSIVE: Override socket's internal methods to force HTTP
                        if (socket && socket.io) {
                            // Override Manager methods
                            if (socket.io.manager) {
                                const manager = socket.io.manager;
                                
                                // Override manager's URL method
                                if (manager.url) {
                                    const originalUrl = manager.url;
                                    manager.url = function() {
                                        const url = originalUrl.call(this);
                                        if (typeof url === 'string' && url.includes('https://')) {
                                            const httpUrl = url.replace('https://', 'http://');
                                            console.log('🔧 Manager URL forced to HTTP:', httpUrl);
                                            return httpUrl;
                                        }
                                        return url;
                                    };
                                }
                                
                                // Override manager's URI method
                                if (manager.uri) {
                                    const originalUri = manager.uri;
                                    manager.uri = function() {
                                        const uri = originalUri.call(this);
                                        if (typeof uri === 'string' && uri.includes('https://')) {
                                            const httpUri = uri.replace('https://', 'http://');
                                            console.log('🔧 Manager URI forced to HTTP:', httpUri);
                                            return httpUri;
                                        }
                                        return uri;
                                    };
                                }
                            }
                            
                            // Override Engine methods
                            if (socket.io.engine) {
                                const engine = socket.io.engine;
                                
                                // Override engine's URL method
                                if (engine.url) {
                                    const originalUrl = engine.url;
                                    engine.url = function() {
                                        const url = originalUrl.call(this);
                                        if (typeof url === 'string' && url.includes('https://')) {
                                            const httpUrl = url.replace('https://', 'http://');
                                            console.log('🔧 Engine URL forced to HTTP:', httpUrl);
                                            return httpUrl;
                                        }
                                        return url;
                                    };
                                }
                                
                                // Override engine's URI method
                                if (engine.uri) {
                                    const originalUri = engine.uri;
                                    engine.uri = function() {
                                        const uri = originalUri.call(this);
                                        if (typeof uri === 'string' && uri.includes('https://')) {
                                            const httpUri = uri.replace('https://', 'http://');
                                            console.log('🔧 Engine URI forced to HTTP:', httpUri);
                                            return httpUri;
                                        }
                                        return uri;
                                    };
                                }
                            }
                        }
                        
                        return socket;
                    };
                    
                    // Copy all static properties from original Socket.IO
                    Object.setPrototypeOf(window.io, originalIO);
                    Object.assign(window.io, originalIO);
                    
                    console.log('✅ Custom Socket.IO client ready - HTTP ONLY');
                }
                
                socket = window.io(\`http://\${window.location.host}/obs-widget\`, {
                    transports: ['polling'],
                    upgrade: false,
                    rememberUpgrade: false,
                    forceNew: true,
                    secure: false,
                    rejectUnauthorized: false,
                    timeout: 5000,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    autoConnect: true,
                    multiplex: false,
                    allowEIO3: true,
                    forceBase64: false,
                    withCredentials: false
                });
                
                socket.on('connect', () => {
                    console.log('WebSocket connected for bank donation updates');
                    socket.emit('joinBankTotalRoom', { streamerId });
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

  private generateErrorHtml(streamerId: string, errorMessage: string): string {
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

  private getThemeStyles(theme: string) {
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

  private logger = {
    error: (message: string, error: any) => {
      console.error(message, error);
    },
  };
}