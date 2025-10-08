import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OBSSettingsService } from './obs-settings.service';
import { Response } from 'express';

@ApiTags('OBS Widget (Public)')
@Controller('widget-public')
export class WidgetPublicController {
  constructor(
    private readonly obsSettingsService: OBSSettingsService,
  ) {}

  @Get('test')
  @ApiOperation({ summary: 'Test route to verify controller registration' })
  async testRoute() {
    return { message: 'Widget controller is working!', timestamp: new Date().toISOString() };
  }

  @Get('alert/:streamerId/:alertToken')
  @ApiOperation({ summary: 'Get OBS widget HTML/JS with streamer ID and alert token (Public endpoint for OBS Browser Source)' })
  @ApiParam({ name: 'streamerId', description: 'Streamer user ID' })
  @ApiParam({ name: 'alertToken', description: 'Alert token for OBS widget' })
  @ApiResponse({
    status: 200,
    description: 'OBS widget HTML/JS served successfully',
    content: {
      'text/html': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'OBS settings not found or invalid token' })
  async serveWidget(
    @Param('streamerId') streamerId: string,
    @Param('alertToken') alertToken: string,
    @Res() res: Response,
  ) {
    try {
      // First verify the alert token exists
      const settings = await this.obsSettingsService.findByAlertToken(alertToken);
      
      // Debug logging to see what settings we got
      console.log('🔧 Widget Debug - Retrieved settings:', {
        streamerId: settings.streamerId,
        alertToken: settings.alertToken?.substring(0, 8) + '...',
        hasImageSettings: !!settings.imageSettings,
        hasSoundSettings: !!settings.soundSettings,
        hasAnimationSettings: !!settings.animationSettings,
        hasStyleSettings: !!settings.styleSettings,
        hasPositionSettings: !!settings.positionSettings,
        hasDisplaySettings: !!settings.displaySettings,
        hasGeneralSettings: !!settings.generalSettings,
        imageSettingsKeys: settings.imageSettings ? Object.keys(settings.imageSettings) : [],
        styleSettingsKeys: settings.styleSettings ? Object.keys(settings.styleSettings) : [],
        displaySettingsKeys: settings.displaySettings ? Object.keys(settings.displaySettings) : [],
      });
      
      // Verify the streamer ID matches the token
      if (settings.streamerId.toString() !== streamerId) {
        // Return error HTML directly
        const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OBS Widget Error</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: transparent; 
                color: #ff4444; 
                text-align: center; 
                padding: 20px; 
              }
            </style>
          </head>
          <body>
            <h3>Widget Not Found</h3>
            <p>Invalid streamer ID or alert token.</p>
            <p>Streamer ID: ${streamerId}</p>
            <p>Token: ${alertToken.substring(0, 8)}...</p>
          </body>
          </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.status(HttpStatus.NOT_FOUND).send(errorHtml);
        return;
      }
      
      // Generate the widget HTML with embedded JavaScript
      const widgetHtml = this.generateWidgetHtml(settings);
      
      // Set content type to HTML
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toISOString());
      res.setHeader('ETag', `"${Date.now()}"`);
      res.setHeader('X-No-Cache', 'true');
      res.setHeader('X-Timestamp', Date.now().toString());
      
      res.send(widgetHtml);
    } catch (error) {
      console.error('Error serving widget:', error);
      
      // Return a simple error page if settings not found
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OBS Widget Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: transparent; 
              color: #ff4444; 
              text-align: center; 
              padding: 20px; 
            }
          </style>
        </head>
        <body>
          <h3>Widget Not Found</h3>
          <p>Invalid or expired alert token.</p>
          <p>Streamer ID: ${streamerId}</p>
          <p>Token: ${alertToken.substring(0, 8)}...</p>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.status(HttpStatus.NOT_FOUND).send(errorHtml);
    }
  }

  /**
   * Escape font family for CSS usage
   */
  private escapeFontFamily(fontFamily: string): string {
    if (!fontFamily) return 'Arial, sans-serif';
    
    // If the font family contains commas, wrap the entire string in quotes
    if (fontFamily.includes(',')) {
      return `"${fontFamily}"`;
    }
    
    // If it's a single font name, wrap it in quotes for safety
    return `"${fontFamily}"`;
  }

  /**
   * Generate HTML widget for OBS Browser Source
   */
  private generateWidgetHtml(settings: any): string {
    const alertToken = settings.alertToken;
    const streamerId = settings.streamerId;
    
    // Get base URL from environment or use default
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Extract settings with defaults and ensure they're properly structured
    const imageSettings = {
      enabled: true,
      mediaType: 'image',
      width: 300,
      height: 200,
      borderRadius: 8,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      ...settings.imageSettings
    };
    
    const soundSettings = {
      enabled: true,
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
      loop: false,
      ...settings.soundSettings
    };
    
    const animationSettings = {
      enabled: true,
      animationType: 'fade',
      duration: 500,
      easing: 'ease-out',
      direction: 'right',
      bounceIntensity: 20,
      zoomScale: 1.2,
      ...settings.animationSettings
    };
    
    const styleSettings = {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#00ff00',
      borderColor: '#333333',
      borderWidth: 2,
      borderStyle: 'solid',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textShadow: true,
      textShadowColor: '#000000',
      textShadowBlur: 3,
      textShadowOffsetX: 1,
      textShadowOffsetY: 1,
      ...settings.styleSettings
    };
    
    const positionSettings = {
      x: 100,
      y: 100,
      anchor: 'top-left',
      zIndex: 1000,
      responsive: true,
      mobileScale: 0.8,
      ...settings.positionSettings
    };
    
    const displaySettings = {
      duration: 5000,
      fadeInDuration: 300,
      fadeOutDuration: 300,
      autoHide: true,
      showProgress: false,
      progressColor: '#00ff00',
      progressHeight: 3,
      ...settings.displaySettings
    };
    
    const generalSettings = {
      enabled: true,
      maxAlerts: 3,
      alertSpacing: 20,
      cooldown: 1000,
      priority: 'medium',
      ...settings.generalSettings
    };
    
    // Debug logging for the final settings that will be passed to JavaScript
    console.log('🔧 Widget Debug - Final settings structure:', {
      imageSettings: Object.keys(imageSettings),
      soundSettings: Object.keys(soundSettings),
      animationSettings: Object.keys(animationSettings),
      styleSettings: Object.keys(styleSettings),
      positionSettings: Object.keys(positionSettings),
      displaySettings: Object.keys(displaySettings),
      generalSettings: Object.keys(generalSettings),
      sampleValues: {
        backgroundColor: styleSettings.backgroundColor,
        fontSize: styleSettings.fontSize,
        duration: displaySettings.duration,
        width: imageSettings.width,
        height: imageSettings.height
      }
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OBS Alert Widget</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <meta name="generated" content="${Date.now()}">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${this.escapeFontFamily(styleSettings.fontFamily || 'Arial, sans-serif')};
            background: transparent;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
          }
          
          .widget-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .alert {
            position: absolute;
            background: ${styleSettings.backgroundColor};
            color: ${styleSettings.textColor};
            padding: 20px;
            border-radius: ${imageSettings.borderRadius}px;
            box-shadow: ${imageSettings.shadow ? '0 10px 30px rgba(0, 0, 0, 0.3)' : 'none'};
            max-width: ${imageSettings.width}px;
            max-height: ${imageSettings.height}px;
            border: ${styleSettings.borderStyle !== 'none' ? `${styleSettings.borderWidth}px ${styleSettings.borderStyle} ${styleSettings.borderColor}` : 'none'};
            opacity: 0;
            transform: translateY(-20px);
            transition: all ${animationSettings.duration}ms ${animationSettings.easing};
            z-index: ${positionSettings.zIndex};
            ${positionSettings.responsive ? `
              @media (max-width: 768px) {
                transform: scale(${positionSettings.mobileScale});
              }
            ` : ''}
          }
          
          .alert.show {
            opacity: 1;
            transform: translateY(0);
          }
          
          .alert.hide {
            opacity: 0;
            transform: translateY(-20px);
          }
          
          .alert.fade-in {
            animation: fadeIn ${displaySettings.fadeInDuration}ms ${animationSettings.easing};
          }
          
          .alert.fade-out {
            animation: fadeOut ${displaySettings.fadeOutDuration}ms ${animationSettings.easing};
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          .alert-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .donor-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            object-fit: cover;
          }
          
          .donor-info h3 {
            font-size: ${styleSettings.fontSize}px;
            font-weight: ${styleSettings.fontWeight};
            margin-bottom: 5px;
          }
          
          .donor-amount {
            font-size: ${Math.floor(styleSettings.fontSize * 1.3)}px;
            font-weight: bold;
            color: ${styleSettings.accentColor};
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            display: inline-block;
          }
          
          .donor-message {
            font-size: ${styleSettings.fontSize}px;
            line-height: 1.4;
            opacity: 0.9;
          }
          
          .alert-timestamp {
            font-size: ${Math.floor(styleSettings.fontSize * 0.75)}px;
            opacity: 0.7;
            margin-top: 10px;
            text-align: right;
          }
          
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="widget-container">
          <div class="alert" id="alertContainer" style="display: none;">
            <div class="alert-header">
              <img src="" alt="Donor" class="donor-avatar" id="donorAvatar">
              <div class="donor-info">
                <h3 id="donorName">Donor Name</h3>
                <div class="donor-amount" id="donorAmount">0.00</div>
              </div>
            </div>
            <div class="alert-media" id="alertMedia" style="margin-bottom:12px;">
              <img id="alertImage" alt="Alert Media" style="display:none; max-width:100%; max-height:100%; object-fit:contain;" />
              <video id="alertVideo" style="display:none; max-width:100%; max-height:100%;" autoplay playsinline muted></video>
            </div>
            <div class="donor-message" id="donorMessage">Thank you for your donation!</div>
            <div class="alert-timestamp" id="alertTimestamp"></div>
          </div>
        </div>
        
        <script src="${baseUrl}/socket.io/socket.io.js"></script>
        <script id="widget-script-${Date.now()}" data-version="2.0.0" data-generated="${Date.now()}">
          // ========================================
          // OBS ALERT WIDGET v2.0.0 - SIMPLIFIED
          // Generated at: ${new Date().toISOString()}
          // Build ID: ${Date.now()}
          // ========================================
          
          console.log('🚀 NEW WIDGET SCRIPT LOADED!');
          console.log('🚀 Build ID:', ${Date.now()});
          console.log('🚀 Timestamp:', new Date().toISOString());
          console.log('🚀 This is the SIMPLIFIED version without setupEventListeners!');
          
          // Widget Version: 2.0.0 - Enhanced Duplicate Prevention
          // Generated: ${new Date().toISOString()}
          // Features: Impression tracking, multi-layer duplicate prevention, enhanced logging
          
          console.log('🔧 Widget script loading... Version 2.0.0');
          console.log('🔧 Timestamp:', new Date().toISOString());
          
          class OBSAlertWidget {
            constructor(alertToken, backendUrl, settings) {
              console.log('🏗️ OBSAlertWidget constructor called');
              console.log('🏗️ AlertToken:', alertToken);
              console.log('🏗️ BackendUrl:', backendUrl);
              console.log('🏗️ Settings received:', settings);
              console.log('🏗️ Settings structure:', {
                hasImageSettings: !!settings.imageSettings,
                hasSoundSettings: !!settings.soundSettings,
                hasAnimationSettings: !!settings.animationSettings,
                hasStyleSettings: !!settings.styleSettings,
                hasPositionSettings: !!settings.positionSettings,
                hasDisplaySettings: !!settings.displaySettings,
                hasGeneralSettings: !!settings.generalSettings,
                imageSettingsKeys: settings.imageSettings ? Object.keys(settings.imageSettings) : [],
                styleSettingsKeys: settings.styleSettings ? Object.keys(settings.styleSettings) : [],
                displaySettingsKeys: settings.displaySettings ? Object.keys(settings.displaySettings) : [],
              });
              
              this.alertToken = alertToken;
              this.backendUrl = backendUrl;
              this.settings = settings;
              this.socket = null;
              this.isConnected = false;
              this.currentAlert = null;
              this.alertQueue = [];
              this.lastAlertTime = 0;
              this.alertCooldown = 20000;
              this.widgetStartTime = Date.now();
              
              // NEW APPROACH: Use localStorage for persistent alert tracking
              this.storageKey = \`obs_widget_alerts_\${alertToken}\`;
              this.shownAlerts = this.loadShownAlerts();
              
              // NEW APPROACH: Global alert registry to prevent duplicates across instances
              if (!window.globalAlertRegistry) {
                window.globalAlertRegistry = new Map();
              }
              
              // NEW APPROACH: Recent alerts cache to prevent immediate duplicates
              this.recentAlerts = new Map(); // Track alerts received in the last 30 seconds
              
              // Wait for DOM to be ready before accessing elements
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                  this.setupElements();
                  this.init();
                });
              } else {
                this.setupElements();
                this.init();
              }
            }
            
            setupElements() {
              this.alertContainer = document.getElementById('alertContainer');
              
              // Safety check - ensure elements exist
              if (!this.alertContainer) {
                console.error('❌ alertContainer element not found!');
                return;
              }
              
              console.log('✅ DOM elements found and ready');
            }
            
            // NEW METHOD: Load shown alerts from localStorage
            loadShownAlerts() {
              try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                  const data = JSON.parse(stored);
                  // Only keep alerts from the last 24 hours
                  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                  const filtered = data.filter(alertId => {
                    if (alertId.includes('_')) {
                      const timestamp = parseInt(alertId.split('_')[1]);
                      return timestamp > oneDayAgo;
                    }
                    return true;
                  });
                  console.log('📦 Loaded', filtered.length, 'shown alerts from localStorage');
                  return new Set(filtered);
                }
              } catch (error) {
                console.error('❌ Error loading shown alerts from localStorage:', error);
              }
              return new Set();
            }
            
            // NEW METHOD: Save shown alerts to localStorage
            saveShownAlerts() {
              try {
                const alertsArray = Array.from(this.shownAlerts);
                localStorage.setItem(this.storageKey, JSON.stringify(alertsArray));
                console.log('💾 Saved', alertsArray.length, 'shown alerts to localStorage');
              } catch (error) {
                console.error('❌ Error saving shown alerts to localStorage:', error);
              }
            }
            
            // NEW METHOD: Check if alert is globally shown
            isAlertGloballyShown(alertId) {
              if (window.globalAlertRegistry.has(alertId)) {
                const registryData = window.globalAlertRegistry.get(alertId);
                const now = Date.now();
                // Keep registry entries for 1 hour
                if (now - registryData.timestamp < 60 * 60 * 1000) {
                  return true;
                } else {
                  // Remove old entry
                  window.globalAlertRegistry.delete(alertId);
                }
              }
              return false;
            }
            
            // NEW METHOD: Mark alert as globally shown
            markAlertGloballyShown(alertId) {
              window.globalAlertRegistry.set(alertId, {
                timestamp: Date.now(),
                widgetId: this.widgetStartTime
              });
            }
            
            // NEW METHOD: Check if alert was recently received
            isAlertRecentlyReceived(alertId) {
              const now = Date.now();
              const thirtySecondsAgo = now - 30000; // 30 seconds
              
              // Clean up old entries
              for (const [id, timestamp] of this.recentAlerts.entries()) {
                if (timestamp < thirtySecondsAgo) {
                  this.recentAlerts.delete(id);
                }
              }
              
              return this.recentAlerts.has(alertId);
            }
            
            // NEW METHOD: Mark alert as recently received
            markAlertRecentlyReceived(alertId) {
              this.recentAlerts.set(alertId, Date.now());
            }
            
            init() {
              console.log('🚀 OBSAlertWidget initializing...');
              this.connectWebSocket();
              
              // Set up periodic cleanup of old alerts
              setInterval(() => {
                const now = Date.now();
                const originalLength = this.alertQueue.length;
                this.alertQueue = this.alertQueue.filter(alert => 
                  now - new Date(alert.timestamp).getTime() < 30000
                );
                
                if (this.alertQueue.length !== originalLength) {
                  console.log('🧹 Cleaned up', originalLength - this.alertQueue.length, 'old alerts from queue');
                }
                
                // Clean up old shown alerts (older than 5 minutes)
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                const originalShownCount = this.shownAlerts.size;
                for (const alertId of this.shownAlerts) {
                  if (alertId.includes('-')) {
                    const timestamp = parseInt(alertId.split('-').pop());
                    if (timestamp < fiveMinutesAgo / 1000) {
                      this.shownAlerts.delete(alertId);
                    }
                  }
                }
                
                if (this.shownAlerts.size !== originalShownCount) {
                  console.log('🧹 Cleaned up', originalShownCount - this.shownAlerts.size, 'old shown alerts');
                }
                
                // Log current state for debugging
                console.log('📊 Widget state - Queue:', this.alertQueue.length, 'Current alert:', this.currentAlert ? 'Yes' : 'No', 'Connected:', this.isConnected, 'Shown alerts tracked:', this.shownAlerts.size);
              }, 10000); // Clean up every 10 seconds
            }
            
            connectWebSocket() {
              try {
                // Prevent multiple connections
                if (this.socket && this.socket.connected) {
                  console.log('WebSocket already connected, skipping new connection');
                  return;
                }
                
                // Disconnect any existing socket first
                if (this.socket) {
                  console.log('Disconnecting existing socket before creating new one');
                  this.socket.disconnect();
                  this.socket = null;
                }
                
                console.log('🔌 Creating new WebSocket connection...');
                
                // Connect to the OBS widget WebSocket endpoint with alert token
                this.socket = io('' + this.backendUrl + '/obs-widget', {
                  query: {
                    alertToken: this.alertToken
                  },
                  reconnection: true,
                  reconnectionAttempts: 5,
                  reconnectionDelay: 1000,
                  timeout: 20000
                });
                
                this.socket.on('connect', () => {
                  console.log('✅ Connected to OBS Widget WebSocket');
                  this.isConnected = true;
                });
                
                this.socket.on('disconnect', () => {
                  console.log('❌ Disconnected from OBS Widget WebSocket');
                  this.isConnected = false;
                });
                
                this.socket.on('joinedStreamerRoom', (data) => {
                  console.log('🏠 Joined streamer room:', data.streamerId);
                });
                
                this.socket.on('donationAlert', (alertData) => {
                  console.log('💰 Received donation alert:', alertData);
                  this.showAlert(alertData);
                });
                
                this.socket.on('testAlert', (alertData) => {
                  console.log('🧪 Received test alert:', alertData);
                  this.showAlert(alertData);
                });
                
                this.socket.on('connect_error', (error) => {
                  console.error('❌ WebSocket connection error:', error);
                  this.isConnected = false;
                });
                
                this.socket.on('reconnect', (attemptNumber) => {
                  console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
                  this.isConnected = true;
                });
                
                this.socket.on('reconnect_error', (error) => {
                  console.error('❌ WebSocket reconnection error:', error);
                });
                
                this.socket.on('reconnect_failed', () => {
                  console.error('❌ WebSocket reconnection failed after all attempts');
                  this.isConnected = false;
                });
                
              } catch (error) {
                console.error('❌ Failed to create OBS Widget WebSocket connection:', error);
                this.isConnected = false;
              }
            }
            
            
            showAlert(alertData) {
              const alertId = alertData.alertId;
              
              if (!alertId) {
                console.log('⚠️ No alertId provided, skipping alert:', alertData.donorName);
                return;
              }
              
              // ULTRA AGGRESSIVE CHECK: If this alert has EVER been shown, skip it completely
              if (this.shownAlerts.has(alertId)) {
                console.log('🚫 Alert has been shown before (localStorage), skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // ULTRA AGGRESSIVE CHECK: If this alert is in global registry, skip it completely
              if (this.isAlertGloballyShown(alertId)) {
                console.log('🚫 Alert has been shown globally, skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // ULTRA AGGRESSIVE CHECK: If this alert was recently received, skip it completely
              if (this.isAlertRecentlyReceived(alertId)) {
                console.log('🚫 Alert received recently, skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // Mark as recently received immediately to prevent duplicates
              this.markAlertRecentlyReceived(alertId);
              
              // Mark as globally shown immediately to prevent duplicates
              this.markAlertGloballyShown(alertId);
              
              // Add to localStorage immediately to prevent duplicates
              this.shownAlerts.add(alertId);
              this.saveShownAlerts();
              
              console.log('📊 Processing alert:', {
                alertId: alertId,
                donorName: alertData.donorName,
                amount: alertData.amount,
                timestamp: new Date(alertData.timestamp || Date.now()).toISOString(),
                isTest: alertData.isTest || false,
                socketConnected: this.isConnected,
                currentAlert: this.currentAlert ? this.currentAlert.alertId : null,
                queueLength: this.alertQueue.length,
                shownAlertsCount: this.shownAlerts.size,
                globalRegistryCount: window.globalAlertRegistry ? window.globalAlertRegistry.size : 0,
                recentAlertsCount: this.recentAlerts.size
              });
              
              // Check cooldown
              const now = Date.now();
              if (now - this.lastAlertTime < this.alertCooldown) {
                console.log('⏱️ Cooldown active, skipping:', alertData.donorName, 'Time since last alert:', now - this.lastAlertTime, 'ms');
                return;
              }
              
              // Check if alert is already in queue
              const isInQueue = this.alertQueue.some(queuedAlert => queuedAlert.alertId === alertId);
              if (isInQueue) {
                console.log('🚫 Alert already in queue, skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // Check if this is the same as the current alert
              if (this.currentAlert && this.currentAlert.alertId === alertId) {
                console.log('🚫 Alert is currently being displayed, skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // If we get here, show the alert
              console.log('✅ Alert approved for display:', alertData.donorName, 'ID:', alertId);
              
              // Clear any current alert (one at a time)
              if (this.currentAlert) {
                console.log('🔄 Clearing current alert to show new one');
                this.clearCurrentAlert();
              }
              
              // SAFETY CHECK: Make sure this alert isn't already in the queue
              const isAlreadyInQueue = this.alertQueue.some(queuedAlert => queuedAlert.alertId === alertId);
              if (isAlreadyInQueue) {
                console.log('🚫 Alert is already in queue, skipping duplicate:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // Clear queue and add this alert
              this.alertQueue = [];
              this.alertQueue.push({ ...alertData, alertId });
              
              console.log('📥 Added alert to queue:', alertData.donorName, 'ID:', alertId, 'Queue length:', this.alertQueue.length);
              
              // Process immediately
              this.processNextAlert();
            }
            
            processNextAlert() {
              console.log('🔄 Processing next alert in queue');
              
              // Safety check to prevent infinite recursion
              if (this.currentAlert && this.alertQueue.length === 0) {
                console.log('⚠️ Safety check: Alert is showing but queue is empty, clearing current alert');
                this.currentAlert = null;
                this.alertContainer.style.display = 'none';
                return;
              }
              
              // If queue is empty, stop processing
              if (this.alertQueue.length === 0) {
                console.log('✅ Queue empty - no more alerts to process');
                this.currentAlert = null;
                return;
              }
              
              // Get next alert from queue
              this.currentAlert = this.alertQueue.shift();
              console.log('🎯 Showing alert:', this.currentAlert.donorName, '- Remaining in queue:', this.alertQueue.length, 'ID:', this.currentAlert.alertId);
              
              // Note: Alert is already marked as shown in showAlert() method
              console.log('✅ Alert already marked as shown in all tracking systems:', this.currentAlert.alertId);
              
              // Apply level-specific settings if available
              this.resetMedia();
              this.applyAlertSettings(this.currentAlert);
              
              // Update alert content
              document.getElementById('donorName').textContent = this.currentAlert.donorName || 'Anonymous';
              
              // SIMPLE AMOUNT FORMATTING - Direct approach
              const amountElement = document.getElementById('donorAmount');
              if (amountElement && this.currentAlert.amount) {
                const amountStr = this.currentAlert.amount.toString();
                const match = amountStr.match(/(\d+(?:\.\d+)?)\s*([A-Za-z]*)/);
                if (match) {
                  const number = parseFloat(match[1]);
                  const currency = match[2] || '';
                  const formatted = number.toLocaleString('vi-VN') + (currency ? ' ' + currency : '');
                  amountElement.textContent = formatted;
                  amountElement.innerHTML = formatted;
                  
                  // Force update with alert to make it visible
                  alert('Amount formatted: ' + amountStr + ' -> ' + formatted);
                }
              }
              
              // Format amount with thousand separators
              const formatAmount = (amountStr) => {
                if (!amountStr) return '0.00';
                
                // Convert to string and extract number and currency
                const str = amountStr.toString().trim();
                const match = str.match(/(\d+(?:\.\d+)?)\s*([A-Za-z]*)/);
                
                if (!match) {
                  console.warn('⚠️ Could not parse amount:', amountStr);
                  return str;
                }
                
                const number = parseFloat(match[1]);
                const currency = match[2] || '';
                
                // Format number with Vietnamese locale (dots as thousand separators)
                const formattedNumber = number.toLocaleString('vi-VN', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 2 
                });
                
                const result = formattedNumber + (currency ? ' ' + currency : '');
                console.log('🔢 Formatting amount:', { 
                  original: amountStr, 
                  number: number, 
                  currency: currency, 
                  formatted: result 
                });
                
                return result;
              };
              
              // Test the formatting function immediately
              console.log('🧪 Testing formatAmount with "50000 VND":', formatAmount('50000 VND'));
              console.log('🧪 Testing formatAmount with "50000":', formatAmount('50000'));
              
              // Simple test with direct number formatting
              const testNumber = 50000;
              const testFormatted = testNumber.toLocaleString('vi-VN');
              console.log('🧪 Direct toLocaleString test:', testNumber, '->', testFormatted);
              
              // Apply formatting to donor amount - FORCE EXECUTION
              console.log('🚨 FORMATTING AMOUNT - STARTING PROCESS');
              console.log('🚨 Current alert amount:', this.currentAlert.amount);
              
              const donorAmountElement = document.getElementById('donorAmount');
              console.log('🚨 Found donorAmount element:', donorAmountElement);
              
              if (donorAmountElement) {
                const formattedAmount = formatAmount(this.currentAlert.amount);
                console.log('🚨 FORMATTING RESULT:', this.currentAlert.amount, '->', formattedAmount);
                
                // Force update the element multiple times to ensure it sticks
                donorAmountElement.textContent = formattedAmount;
                donorAmountElement.innerHTML = formattedAmount;
                donorAmountElement.innerText = formattedAmount;
                
                console.log('🚨 ELEMENT UPDATED - textContent:', donorAmountElement.textContent);
                console.log('🚨 ELEMENT UPDATED - innerHTML:', donorAmountElement.innerHTML);
                
                // Force a re-render by temporarily hiding and showing
                donorAmountElement.style.display = 'none';
                setTimeout(() => {
                  donorAmountElement.style.display = '';
                  donorAmountElement.textContent = formattedAmount;
                  console.log('🚨 AFTER RE-RENDER - textContent:', donorAmountElement.textContent);
                }, 10);
                
                // Also try a more aggressive approach
                setTimeout(() => {
                  donorAmountElement.textContent = formattedAmount;
                  console.log('🚨 FINAL CHECK - textContent:', donorAmountElement.textContent);
                }, 100);
                
              } else {
                console.error('🚨 ERROR: donorAmount element not found');
              }
              document.getElementById('donorMessage').textContent = this.currentAlert.message || 'Thank you for your donation!';

              // Auto-fit donor amount so the currency like VND is fully visible
              // Note: fitDonorAmount function is not defined, skipping for now
              
              const timestamp = new Date(this.currentAlert.timestamp || Date.now());
              document.getElementById('alertTimestamp').textContent = timestamp.toLocaleTimeString();
              
              // Show alert with animation
              this.alertContainer.style.display = 'block';
              this.alertContainer.classList.add('fade-in');
              
              console.log('🎬 ALERT NOW VISIBLE ON SCREEN:', this.currentAlert.donorName, 'ID:', this.currentAlert.alertId);
              console.log('🎬 Display timestamp:', new Date().toISOString());
              console.log('🎬 Time since last alert:', Date.now() - this.lastAlertTime, 'ms');
              
              // Update last alert time for cooldown
              this.lastAlertTime = Date.now();
              
              // Auto-hide after configured duration, then process next alert
              const displayDuration = this.getDisplayDuration();
              console.log('⏰ Alert will hide in ' + displayDuration + 'ms');
              
              setTimeout(() => {
                this.hideAlert();
              }, displayDuration);
            }
            
            // NEW METHOD: Apply level-specific settings to the alert
            applyAlertSettings(alertData) {
              if (!alertData.settings) {
                console.log('📝 No level-specific settings found, using basic settings');
                return;
              }
              
              const settings = alertData.settings;
              console.log('🎨 Applying level-specific settings:', {
                hasImageSettings: !!settings.imageSettings,
                hasSoundSettings: !!settings.soundSettings,
                hasAnimationSettings: !!settings.animationSettings,
                hasStyleSettings: !!settings.styleSettings,
                hasPositionSettings: !!settings.positionSettings,
                hasDisplaySettings: !!settings.displaySettings,
                hasGeneralSettings: !!settings.generalSettings,
                donationLevel: settings.donationLevel
              });
              
              // Apply image settings
              if (settings.imageSettings) {
                // If a level media URL is provided, hide base avatar so basic media won't show
                if (settings.imageSettings.url) {
                  var avatarEl = document.getElementById('donorAvatar');
                  if (avatarEl) { avatarEl.src = ''; avatarEl.style.display = 'none'; }
                }
                this.applyImageSettings(settings.imageSettings);
              }
              
              // Apply sound settings
              if (settings.soundSettings) {
                this.applySoundSettings(settings.soundSettings);
              }
              
              // Apply style settings
              if (settings.styleSettings) {
                this.applyStyleSettings(settings.styleSettings);
              }
              
              // Apply position settings
              if (settings.positionSettings) {
                this.applyPositionSettings(settings.positionSettings);
              }
              
              // Apply animation settings
              if (settings.animationSettings) {
                this.applyAnimationSettings(settings.animationSettings);
              }
              
              // Apply display settings
              if (settings.displaySettings) {
                this.applyDisplaySettings(settings.displaySettings);
              }
              
              // Apply general settings
              if (settings.generalSettings) {
                this.applyGeneralSettings(settings.generalSettings);
              }
            }
            
            // NEW METHOD: Apply image settings
            applyImageSettings(imageSettings) {
              // Apply media URL to donor avatar if provided
              try {
                if (imageSettings.url) {
                  // Decide whether to show image or video for the alert media
                  var imageEl = document.getElementById('alertImage');
                  var videoEl = document.getElementById('alertVideo');
                  var mediaWrap = document.getElementById('alertMedia');
                  if (mediaWrap) {
                    mediaWrap.style.display = 'block';
                  }
                  var mediaType = imageSettings.mediaType || 'image';
                  var lowerUrl = (imageSettings.url || '').toLowerCase();
                  if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || mediaType === 'video') {
                    console.log('🎥 Widget applying VIDEO URL:', (imageSettings.url || '').slice(0,100) + (imageSettings.url && imageSettings.url.length>100?'...':''));
                    if (imageEl) imageEl.style.display = 'none';
                    if (videoEl) {
                      videoEl.style.display = 'block';
                      try { videoEl.pause(); } catch (e) {}
                      videoEl.src = imageSettings.url;
                      videoEl.currentTime = 0;
                      var p = videoEl.play();
                      if (p && typeof p.then === 'function') { p.catch(function(err){ console.warn('Video autoplay blocked:', err); }); }
                    }
                  } else {
                    console.log('🖼️ Widget applying IMAGE URL:', (imageSettings.url || '').slice(0,100) + (imageSettings.url && imageSettings.url.length>100?'...':''));
                    if (videoEl) { try { videoEl.pause(); } catch (e) {} videoEl.style.display = 'none'; }
                    if (imageEl) {
                      imageEl.src = imageSettings.url;
                      imageEl.style.display = 'block';
                    }
                  }
                } else {
                  console.log('🖼️ Widget imageSettings has no url; skipping');
                }
              } catch (err) {
                console.error('❌ Failed to apply media URL:', err);
              }
              if (imageSettings.width) {
                this.alertContainer.style.maxWidth = '' + imageSettings.width + 'px';
              }
              if (imageSettings.height) {
                this.alertContainer.style.maxHeight = '' + imageSettings.height + 'px';
              }
              if (imageSettings.borderRadius !== undefined) {
                this.alertContainer.style.borderRadius = '' + imageSettings.borderRadius + 'px';
              }
              if (imageSettings.shadow !== undefined) {
                this.alertContainer.style.boxShadow = imageSettings.shadow ? 
                  '0 10px 30px rgba(0, 0, 0, 0.3)' : 'none';
              }
            }
            
            // NEW METHOD: Apply and play sound settings
            applySoundSettings(soundSettings) {
              try {
                if (!soundSettings.url) {
                  console.log('🔊 Widget soundSettings has no url; skipping');
                  return;
                }
                console.log('🔊 Widget applying SOUND URL:', (soundSettings.url || '').slice(0,100) + (soundSettings.url && soundSettings.url.length>100?'...':''));
                if (!this.audioEl) {
                  this.audioEl = new Audio();
                }
                this.audioEl.src = soundSettings.url;
                if (typeof soundSettings.volume === 'number') {
                  this.audioEl.volume = soundSettings.volume > 1
                    ? Math.max(0, Math.min(1, soundSettings.volume / 100))
                    : Math.max(0, Math.min(1, soundSettings.volume));
                }
                this.audioEl.currentTime = 0;
                const playPromise = this.audioEl.play();
                if (playPromise && typeof playPromise.then === 'function') {
                  playPromise.catch(err => console.warn('⚠️ Audio play blocked by browser:', err));
                }
              } catch (err) {
                console.error('❌ Failed to play sound:', err);
              }
            }
            
            // NEW METHOD: Apply style settings
            applyStyleSettings(styleSettings) {
              if (styleSettings.backgroundColor) {
                this.alertContainer.style.backgroundColor = styleSettings.backgroundColor;
              }
              if (styleSettings.textColor) {
                this.alertContainer.style.color = styleSettings.textColor;
              }
              if (styleSettings.fontFamily) {
                this.alertContainer.style.fontFamily = styleSettings.fontFamily;
              }
              if (styleSettings.fontSize) {
                this.alertContainer.style.fontSize = '' + styleSettings.fontSize + 'px';
              }
              if (styleSettings.fontWeight) {
                this.alertContainer.style.fontWeight = styleSettings.fontWeight;
              }
              if (styleSettings.fontStyle) {
                this.alertContainer.style.fontStyle = styleSettings.fontStyle;
              }
              if (styleSettings.borderWidth !== undefined && styleSettings.borderStyle && styleSettings.borderColor) {
                this.alertContainer.style.border = '' + styleSettings.borderWidth + 'px ' + styleSettings.borderStyle + ' ' + styleSettings.borderColor;
              }
              if (styleSettings.textShadow !== undefined) {
                if (styleSettings.textShadow) {
                  this.alertContainer.style.textShadow = '' + (styleSettings.textShadowOffsetX || 1) + 'px ' + (styleSettings.textShadowOffsetY || 1) + 'px ' + (styleSettings.textShadowBlur || 3) + 'px ' + (styleSettings.textShadowColor || '#000000');
                } else {
                  this.alertContainer.style.textShadow = 'none';
                }
              }
            }
            
            // NEW METHOD: Apply position settings
            applyPositionSettings(positionSettings) {
              if (positionSettings.x !== undefined) {
                this.alertContainer.style.left = '' + positionSettings.x + 'px';
              }
              if (positionSettings.y !== undefined) {
                this.alertContainer.style.top = '' + positionSettings.y + 'px';
              }
              if (positionSettings.zIndex !== undefined) {
                this.alertContainer.style.zIndex = positionSettings.zIndex;
              }
            }
            
            // NEW METHOD: Apply animation settings
            applyAnimationSettings(animationSettings) {
              if (animationSettings.duration !== undefined) {
                this.alertContainer.style.transitionDuration = '' + animationSettings.duration + 'ms';
              }
              if (animationSettings.easing) {
                this.alertContainer.style.transitionTimingFunction = animationSettings.easing;
              }
            }
            
            // NEW METHOD: Apply display settings
            applyDisplaySettings(displaySettings) {
              // Display duration is handled in processNextAlert
              // Other display settings can be applied here if needed
            }
            
            // NEW METHOD: Apply general settings
            applyGeneralSettings(generalSettings) {
              // General settings like cooldown, maxAlerts, etc. are handled elsewhere
              // This method is here for future expansion
            }
            
            // NEW METHOD: Get display duration (level-specific or basic)
            getDisplayDuration() {
              if (this.currentAlert && this.currentAlert.settings && this.currentAlert.settings.displaySettings) {
                return this.currentAlert.settings.displaySettings.duration || 5000;
              }
              return this.settings.displaySettings?.duration || 5000;
            }
            
            hideAlert() {
              console.log('👋 Hiding current alert:', this.currentAlert?.donorName, 'ID:', this.currentAlert?.alertId);
              
              // Safety check - if no current alert, just return
              if (!this.currentAlert) {
                console.log('⚠️ No current alert to hide');
                return;
              }
              
              // Apply fade out animation
              this.alertContainer.classList.add('fade-out');
              
              const fadeOutDuration = this.settings.displaySettings?.fadeOutDuration || 300;
              setTimeout(() => {
                this.alertContainer.style.display = 'none';
                this.alertContainer.classList.remove('fade-out');
                
                // Clear the current alert reference
                this.currentAlert = null;
                
                // Process next alert in queue after fade out completes
                if (this.alertQueue.length > 0) {
                  console.log('🔄 Fade out complete, processing next alert');
                  // Use setTimeout to prevent potential stack overflow
                  setTimeout(() => {
                    this.processNextAlert();
                  }, 0);
                } else {
                  console.log('✅ No more alerts in queue');
                }
              }, fadeOutDuration);
            }
            
          
            
            clearQueue() {
              console.log('🧹 Clearing alert queue');
              this.alertQueue = [];
              this.currentAlert = null;
              this.alertContainer.style.display = 'none';
              this.alertContainer.classList.remove('fade-in', 'fade-out');
            }
            
            clearCurrentAlert() {
              console.log('🔄 Clearing current alert for one-alert-at-a-time mode');
              if (this.currentAlert) {
                // Don't mark as shown here - only mark when actually displayed
                // This preserves the duplicate detection logic
                
                // Hide the alert immediately
                this.alertContainer.style.display = 'none';
                this.alertContainer.classList.remove('fade-in', 'fade-out');
                
                // Clear the current alert reference
                this.currentAlert = null;
              }
            }
            
            resetDuplicateTracking() {
              console.log('🔄 Resetting duplicate alert tracking');
              this.shownAlerts.clear();
              this.saveShownAlerts(); // Clear localStorage
              this.recentAlerts.clear(); // Clear recent alerts
              this.clearQueue();
              this.clearCurrentAlert();
              this.lastAlertTime = 0; // Reset cooldown
              this.widgetStartTime = Date.now(); // Reset widget start time
              
              // Clear global registry for this widget
              if (window.globalAlertRegistry) {
                const widgetId = this.widgetStartTime;
                for (const [alertId, data] of window.globalAlertRegistry.entries()) {
                  if (data.widgetId === widgetId) {
                    window.globalAlertRegistry.delete(alertId);
                  }
                }
                console.log('🧹 Cleared global registry entries for this widget');
              }
            }
            
            resetCooldown() {
              console.log('⏱️ Resetting alert cooldown');
              this.lastAlertTime = 0;
            }
            
            // Debug method to check if a specific alertId is being tracked
            isAlertIdTracked(alertId) {
              const isShownInStorage = this.shownAlerts.has(alertId);
              const isGloballyShown = this.isAlertGloballyShown(alertId);
              const isRecentlyReceived = this.isAlertRecentlyReceived(alertId);
              const isCurrent = this.currentAlert && this.currentAlert.alertId === alertId;
              const isQueued = this.alertQueue.some(qAlert => qAlert.alertId === alertId);
              
              return {
                alertId,
                isShownInStorage,
                isGloballyShown,
                isRecentlyReceived,
                isCurrent,
                isQueued,
                shownAlertsCount: this.shownAlerts.size,
                globalRegistryCount: window.globalAlertRegistry ? window.globalAlertRegistry.size : 0,
                recentAlertsCount: this.recentAlerts.size,
                currentAlertId: this.currentAlert?.alertId,
                queueLength: this.alertQueue.length
              };
            }
            
            // Simple test method to verify widget is working
            test() {
              console.log('🧪 Widget test method called');
              console.log('🧪 Current state:', {
                isConnected: this.isConnected,
                alertQueueLength: this.alertQueue.length,
                currentAlert: this.currentAlert ? 'Yes' : 'No',
                shownAlertsCount: this.shownAlerts.size,
                globalRegistryCount: window.globalAlertRegistry ? window.globalAlertRegistry.size : 0
              });
              return 'Widget is working!';
            }
            
            // NEW METHOD: Clear localStorage completely
            clearLocalStorage() {
              try {
                localStorage.removeItem(this.storageKey);
                this.shownAlerts.clear();
                console.log('🗑️ Cleared localStorage for widget:', this.storageKey);
                return true;
              } catch (error) {
                console.error('❌ Error clearing localStorage:', error);
                return false;
              }
            }
            
            // NEW METHOD: Clear global registry completely
            clearGlobalRegistry() {
              if (window.globalAlertRegistry) {
                window.globalAlertRegistry.clear();
                console.log('🗑️ Cleared global alert registry');
                return true;
              }
              return false;
            }
            
            // NEW METHOD: Clear recent alerts
            clearRecentAlerts() {
              this.recentAlerts.clear();
              console.log('🗑️ Cleared recent alerts cache');
              return true;
            }
            
            // NEW METHOD: Show detailed tracking info for an alert
            showAlertTrackingInfo(alertId) {
              const now = Date.now();
              const isInStorage = this.shownAlerts.has(alertId);
              const isInGlobal = this.isAlertGloballyShown(alertId);
              const isRecent = this.isAlertRecentlyReceived(alertId);
              const isCurrent = this.currentAlert && this.currentAlert.alertId === alertId;
              const isQueued = this.alertQueue.some(qAlert => qAlert.alertId === alertId);
              
              let globalInfo = null;
              if (window.globalAlertRegistry && window.globalAlertRegistry.has(alertId)) {
                const data = window.globalAlertRegistry.get(alertId);
                globalInfo = {
                  timestamp: new Date(data.timestamp).toISOString(),
                  widgetId: data.widgetId,
                  timeSinceRegistered: now - data.timestamp + 'ms'
                };
              }
              
              let recentInfo = null;
              if (this.recentAlerts.has(alertId)) {
                const timestamp = this.recentAlerts.get(alertId);
                recentInfo = {
                  timestamp: new Date(timestamp).toISOString(),
                  timeSinceReceived: now - timestamp + 'ms'
                };
              }
              
              return {
                alertId,
                tracking: {
                  isInStorage,
                  isInGlobal,
                  isRecent,
                  isCurrent,
                  isQueued
                },
                details: {
                  globalInfo,
                  recentInfo,
                  currentAlertId: this.currentAlert?.alertId,
                  queueLength: this.alertQueue.length,
                  shownAlertsCount: this.shownAlerts.size,
                  globalRegistryCount: window.globalAlertRegistry ? window.globalAlertRegistry.size : 0,
                  recentAlertsCount: this.recentAlerts.size
                }
              };
            }
            
            // NEW METHOD: Show current queue contents
            showQueueContents() {
              return {
                queueLength: this.alertQueue.length,
                currentAlert: this.currentAlert ? {
                  name: this.currentAlert.donorName,
                  id: this.currentAlert.alertId,
                  timestamp: new Date(this.currentAlert.timestamp || Date.now()).toISOString()
                } : null,
                queueContents: this.alertQueue.map((alert, index) => ({
                  index,
                  name: alert.donorName,
                  id: alert.alertId,
                  timestamp: new Date(alert.timestamp || Date.now()).toISOString()
                }))
              };
            }
            
            // Debug method to compare two alertIds
            compareAlertIds(alertId1, alertId2) {
              const isExactMatch = alertId1 === alertId2;
              const isSimilar = alertId1 && alertId2 && 
                (alertId1.includes(alertId2.substring(0, 10)) || 
                 alertId2.includes(alertId1.substring(0, 10)));
              
              return {
                alertId1: alertId1,
                alertId2: alertId2,
                isExactMatch: isExactMatch,
                isSimilar: isSimilar,
                length1: alertId1 ? alertId1.length : 0,
                length2: alertId2 ? alertId2.length : 0,
                analysis: isExactMatch ? 'EXACT MATCH' : 
                         isSimilar ? 'SIMILAR (partial match)' : 'COMPLETELY DIFFERENT'
              };
            }
            
            // Debug method to show current state
            getDebugInfo() {
              const now = Date.now();
              const timeSinceLastAlert = now - this.lastAlertTime;
              const cooldownRemaining = Math.max(0, this.alertCooldown - timeSinceLastAlert);
              const timeSinceWidgetStart = now - this.widgetStartTime;
              
              return {
                queueLength: this.alertQueue.length,
                currentAlert: this.currentAlert ? {
                  name: this.currentAlert.donorName,
                  id: this.currentAlert.alertId
                } : null,
                shownAlertsCount: this.shownAlerts.size,
                shownAlertIds: Array.from(this.shownAlerts),
                globalRegistryCount: window.globalAlertRegistry ? window.globalAlertRegistry.size : 0,
                globalRegistryEntries: window.globalAlertRegistry ? Array.from(window.globalAlertRegistry.entries()).map(([alertId, data]) => ({
                  alertId,
                  timestamp: new Date(data.timestamp).toISOString(),
                  widgetId: data.widgetId,
                  timeSinceRegistered: now - data.timestamp + 'ms'
                })) : [],
                recentAlertsCount: this.recentAlerts.size,
                recentAlerts: Array.from(this.recentAlerts.entries()).map(([alertId, timestamp]) => ({
                  alertId,
                  receivedAt: new Date(timestamp).toISOString(),
                  timeSinceReceived: now - timestamp + 'ms'
                })),
                isConnected: this.isConnected,
                timeSinceWidgetStart: timeSinceWidgetStart + 'ms',
                storageKey: this.storageKey,
                cooldown: {
                  lastAlertTime: this.lastAlertTime,
                  timeSinceLastAlert: timeSinceLastAlert,
                  cooldownRemaining: cooldownRemaining,
                  isActive: cooldownRemaining > 0
                }
              };
            }
            
            // Debug method to get widget settings
            getSettings() {
              return {
                alertToken: this.alertToken,
                backendUrl: this.backendUrl,
                settings: this.settings,
                settingsStructure: {
                  hasImageSettings: !!this.settings.imageSettings,
                  hasSoundSettings: !!this.settings.soundSettings,
                  hasAnimationSettings: !!this.settings.animationSettings,
                  hasStyleSettings: !!this.settings.styleSettings,
                  hasPositionSettings: !!this.settings.positionSettings,
                  hasDisplaySettings: !!this.settings.displaySettings,
                  hasGeneralSettings: !!this.settings.generalSettings,
                  imageSettingsKeys: this.settings.imageSettings ? Object.keys(this.settings.imageSettings) : [],
                  styleSettingsKeys: this.settings.styleSettings ? Object.keys(this.settings.styleSettings) : [],
                  displaySettingsKeys: this.settings.displaySettings ? Object.keys(this.settings.displaySettings) : [],
                },
                sampleValues: {
                  backgroundColor: this.settings.styleSettings?.backgroundColor,
                  fontSize: this.settings.styleSettings?.fontSize,
                  duration: this.settings.displaySettings?.duration,
                  width: this.settings.imageSettings?.width,
                  height: this.settings.imageSettings?.height
                }
              };
            }
            
            destroy() {
              console.log('��️ Destroying widget');
              this.clearQueue();
              this.clearCurrentAlert();
              this.shownAlerts.clear();
              this.saveShownAlerts(); // Clear localStorage
              
              // Clear global registry entries for this widget
              if (window.globalAlertRegistry) {
                const widgetId = this.widgetStartTime;
                for (const [alertId, data] of window.globalAlertRegistry.entries()) {
                  if (data.widgetId === widgetId) {
                    window.globalAlertRegistry.delete(alertId);
                  }
                }
              }
              
              if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
              }
              
              this.isConnected = false;
            }
          }
          
          // Initialize widget when page loads
          document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM Content Loaded - Creating widget...');
            
            // Prevent multiple widget instances
            if (window.obsAlertWidget) {
              console.log('⚠️ Widget already exists, destroying old instance');
              window.obsAlertWidget.destroy();
            }
            
            const widget = new OBSAlertWidget('${alertToken}', '${baseUrl}', {
              imageSettings: ${JSON.stringify(imageSettings)},
              soundSettings: ${JSON.stringify(soundSettings)},
              animationSettings: ${JSON.stringify(animationSettings)},
              styleSettings: ${JSON.stringify(styleSettings)},
              positionSettings: ${JSON.stringify(positionSettings)},
              displaySettings: ${JSON.stringify(displaySettings)},
              generalSettings: ${JSON.stringify(generalSettings)}
            });
            
            // Store widget instance globally for debugging
            window.obsAlertWidget = widget;
            
            // Expose debug methods on window for testing
            window.widgetDebug = {
              resetTracking: () => widget.resetDuplicateTracking(),
              resetCooldown: () => widget.resetCooldown(),
              clearCurrentAlert: () => widget.clearCurrentAlert(),
              getInfo: () => widget.getDebugInfo(),
              getSettings: () => widget.getSettings(),
              clearQueue: () => widget.clearQueue(),
              isAlertIdTracked: (id) => widget.isAlertIdTracked(id),
              test: () => widget.test(), // Expose the new test method
              destroy: () => {
                widget.destroy();
                window.obsAlertWidget = null;
                console.log('🗑️ Widget destroyed via debug command');
              },
              reconnect: () => {
                console.log('🔄 Reconnecting WebSocket via debug command');
                widget.connectWebSocket();
              },
              clearLocalStorage: () => widget.clearLocalStorage(),
              clearGlobalRegistry: () => widget.clearGlobalRegistry(),
              clearRecentAlerts: () => widget.clearRecentAlerts(),
              showAlertTrackingInfo: (id) => widget.showAlertTrackingInfo(id),
              showQueueContents: () => widget.showQueueContents()
            };
            
            // Clean up widget when page is unloaded
            window.addEventListener('beforeunload', () => {
              widget.destroy();
              window.obsAlertWidget = null;
            });
          });
        </script>
      </body>
      </html>
    `;
  }
} 