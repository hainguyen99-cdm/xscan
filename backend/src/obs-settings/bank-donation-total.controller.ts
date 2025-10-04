import { Controller, Get, Param, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { BankDonationTotalService } from './bank-donation-total.service';

@ApiTags('Bank Donation Total Widget')
@Controller('widget-public/bank-total')
export class BankDonationTotalController {
  constructor(
    private readonly bankDonationTotalService: BankDonationTotalService,
  ) {}

  @Get(':streamerId')
  @ApiOperation({ summary: 'Get bank donation total widget for OBS' })
  @ApiParam({ name: 'streamerId', description: 'Streamer ID' })
  @ApiQuery({ name: 'format', required: false, description: 'Response format (html, json)', enum: ['html', 'json'] })
  @ApiQuery({ name: 'theme', required: false, description: 'Widget theme', enum: ['dark', 'light', 'transparent'] })
  @ApiQuery({ name: 'showStats', required: false, description: 'Show additional statistics', type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Widget HTML or JSON data' })
  async getBankDonationTotalWidget(
    @Param('streamerId') streamerId: string,
    @Query('format') format: string = 'html',
    @Query('theme') theme: string = 'dark',
    @Query('showStats') showStats: string = 'false',
    @Res() res: Response,
  ) {
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

      // Generate HTML widget
      const stats = showStatsBool 
        ? await this.bankDonationTotalService.getBankDonationStats(streamerId)
        : await this.bankDonationTotalService.getTotalBankDonations(streamerId);

      const html = this.generateWidgetHtml(streamerId, stats, theme, showStatsBool);
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
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
  ): string {
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
        
        // Auto-refresh every 30 seconds with animation
        setInterval(async () => {
            try {
                // Force HTTP protocol since the server only supports HTTP
                const currentUrl = window.location.href;
                let refreshUrl;
                
                // Remove existing format parameter if present
                if (currentUrl.includes('format=')) {
                    refreshUrl = currentUrl.replace(/[?&]format=[^&]*/, '') + '&format=json';
                } else {
                    refreshUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'format=json';
                }
                
                // Force HTTP protocol to avoid SSL errors
                refreshUrl = refreshUrl.replace('https:', 'http:');
                
                console.log('Refreshing data from:', refreshUrl);
                
                const response = await fetch(refreshUrl);
                const data = await response.json();
                
                if (data.success && data.data.totalAmount !== currentAmount) {
                    animateToNewAmount(data.data.totalAmount);
                }
            } catch (error) {
                console.error('Failed to refresh data:', error);
                // Fallback to page reload
                location.reload();
            }
        }, 30000);
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
