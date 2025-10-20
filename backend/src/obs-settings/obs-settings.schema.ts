import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OBSSettingsDocument = OBSSettings & Document;

@Schema({ timestamps: true })
export class OBSSettings {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  streamerId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 32,
    maxlength: 64,
  })
  alertToken: string;

  // Security settings
  @Prop({
    type: {
      tokenExpiresAt: { type: Date },
      lastTokenRegeneration: { type: Date },
      allowedIPs: [{ type: String, trim: true }],
      maxConnections: { type: Number, min: 1, max: 100, default: 10 },
      requireIPValidation: { type: Boolean, default: false },
      requireRequestSigning: { type: Boolean, default: false },
      requestSignatureSecret: { type: String, trim: true },
      lastSecurityAudit: { type: Date },
      securityViolations: [{ 
        type: { type: String, enum: ['invalid_token', 'ip_blocked', 'rate_limit_exceeded', 'replay_attack', 'signature_mismatch'] },
        timestamp: { type: Date, default: Date.now },
        ip: { type: String },
        userAgent: { type: String },
        details: { type: String }
      }],
      isTokenRevoked: { type: Boolean, default: false },
      revokedAt: { type: Date },
      revocationReason: { type: String },
    },
    default: {},
  })
  securitySettings: {
    tokenExpiresAt?: Date;
    lastTokenRegeneration?: Date;
    allowedIPs?: string[];
    maxConnections: number;
    requireIPValidation: boolean;
    requireRequestSigning: boolean;
    requestSignatureSecret?: string;
    lastSecurityAudit?: Date;
    securityViolations?: Array<{
      type: 'invalid_token' | 'ip_blocked' | 'rate_limit_exceeded' | 'replay_attack' | 'signature_mismatch';
      timestamp: Date;
      ip?: string;
      userAgent?: string;
      details?: string;
    }>;
    isTokenRevoked: boolean;
    revokedAt?: Date;
    revocationReason?: string;
  };

  // Image/GIF/video settings
  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      url: { type: String, trim: true },
      mediaType: { type: String, enum: ['image', 'gif', 'video'], default: 'image' },
      width: { type: Number, min: 50, max: 1920, default: 300 },
      height: { type: Number, min: 50, max: 1080, default: 200 },
      borderRadius: { type: Number, min: 0, max: 50, default: 8 },
      shadow: { type: Boolean, default: true },
      shadowColor: { type: String, default: '#000000' },
      shadowBlur: { type: Number, min: 0, max: 50, default: 10 },
      shadowOffsetX: { type: Number, min: -20, max: 20, default: 2 },
      shadowOffsetY: { type: Number, min: -20, max: 20, default: 2 },
    },
    default: {},
  })
  imageSettings: {
    enabled: boolean;
    url?: string;
    mediaType: 'image' | 'gif' | 'video';
    width: number;
    height: number;
    borderRadius: number;
    shadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
  };

  // Sound settings
  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      url: { type: String, trim: true },
      volume: { type: Number, min: 0, max: 100, default: 80 },
      fadeIn: { type: Number, min: 0, max: 5000, default: 0 },
      fadeOut: { type: Number, min: 0, max: 5000, default: 0 },
      loop: { type: Boolean, default: false },
    },
    default: {},
  })
  soundSettings: {
    enabled: boolean;
    url?: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    loop: boolean;
  };

  // Animation effects
  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      animationType: { type: String, enum: ['fade', 'slide', 'bounce', 'zoom', 'none'], default: 'fade' },
      duration: { type: Number, min: 200, max: 5000, default: 500 },
      easing: { type: String, enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'], default: 'ease-out' },
      direction: { type: String, enum: ['left', 'right', 'top', 'bottom'], default: 'right' },
      bounceIntensity: { type: Number, min: 0, max: 100, default: 20 },
      zoomScale: { type: Number, min: 0.1, max: 3, default: 1.2 },
    },
    default: {},
  })
  animationSettings: {
    enabled: boolean;
    animationType: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
    duration: number;
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    direction: 'left' | 'right' | 'top' | 'bottom';
    bounceIntensity: number;
    zoomScale: number;
  };

  // Colors and fonts
  @Prop({
    type: {
      backgroundColor: { type: String, default: '#1a1a1a' },
      textColor: { type: String, default: '#ffffff' },
      accentColor: { type: String, default: '#00ff00' },
      borderColor: { type: String, default: '#333333' },
      borderWidth: { type: Number, min: 0, max: 10, default: 2 },
      borderStyle: { type: String, enum: ['solid', 'dashed', 'dotted', 'none'], default: 'solid' },
      fontFamily: { type: String, default: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' },
      fontSize: { type: Number, min: 12, max: 72, default: 16 },
      fontWeight: { type: String, enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'], default: 'normal' },
      fontStyle: { type: String, enum: ['normal', 'italic'], default: 'normal' },
      textShadow: { type: Boolean, default: true },
      textShadowColor: { type: String, default: '#000000' },
      textShadowBlur: { type: Number, min: 0, max: 20, default: 3 },
      textShadowOffsetX: { type: Number, min: -10, max: 10, default: 1 },
      textShadowOffsetY: { type: Number, min: -10, max: 10, default: 1 },
    },
    default: {},
  })
  styleSettings: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: 'normal' | 'italic';
    textShadow: boolean;
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
  };

  // Position settings
  @Prop({
    type: {
      x: { type: Number, min: 0, max: 1920, default: 100 },
      y: { type: Number, min: 0, max: 1080, default: 100 },
      anchor: { type: String, enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'], default: 'middle-center' },
      zIndex: { type: Number, min: 0, max: 9999, default: 1000 },
      responsive: { type: Boolean, default: true },
      mobileScale: { type: Number, min: 0.1, max: 2, default: 0.8 },
    },
    default: {},
  })
  positionSettings: {
    x: number;
    y: number;
    anchor: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    zIndex: number;
    responsive: boolean;
    mobileScale: number;
  };

  // Display duration
  @Prop({
    type: {
      duration: { type: Number, min: 1000, max: 30000, default: 5000 },
      fadeInDuration: { type: Number, min: 0, max: 5000, default: 300 },
      fadeOutDuration: { type: Number, min: 0, max: 5000, default: 300 },
      autoHide: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: false },
      progressColor: { type: String, default: '#00ff00' },
      progressHeight: { type: Number, min: 1, max: 20, default: 3 },
    },
    default: {},
  })
  displaySettings: {
    duration: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    autoHide: boolean;
    showProgress: boolean;
    progressColor: string;
    progressHeight: number;
  };

  // Additional settings
  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      maxAlerts: { type: Number, min: 1, max: 10, default: 3 },
      alertSpacing: { type: Number, min: 0, max: 100, default: 20 },
      cooldown: { type: Number, min: 0, max: 60000, default: 1000 },
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    },
    default: {},
  })
  generalSettings: {
    enabled: boolean;
    maxAlerts: number;
    alertSpacing: number;
    cooldown: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };

  @Prop({ default: false })
  isActive: boolean;

  // Settings behavior control
  @Prop({ 
    type: String, 
    enum: ['auto', 'basic', 'donation-levels'], 
    default: 'auto',
    description: 'Controls which settings to use: auto (use donation levels if available and matching, otherwise basic), basic (always use basic settings), donation-levels (always use donation levels if available)'
  })
  settingsBehavior: 'auto' | 'basic' | 'donation-levels';

  @Prop({ type: Date })
  lastUsedAt?: Date;

  @Prop({ type: Number, default: 0 })
  totalAlerts: number;

  // Configuration presets
  @Prop({
    type: [{
      presetId: { type: String, required: true },
      presetName: { type: String, required: true },
      description: { type: String },
      configuration: {
        imageSettings: { type: Object },
        soundSettings: { type: Object },
        animationSettings: { type: Object },
        styleSettings: { type: Object },
        positionSettings: { type: Object },
        displaySettings: { type: Object },
        generalSettings: { type: Object },
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }],
    default: [],
  })
  presets: Array<{
    presetId: string;
    presetName: string;
    description?: string;
    configuration: {
      imageSettings?: any;
      soundSettings?: any;
      animationSettings?: any;
      styleSettings?: any;
      positionSettings?: any;
      displaySettings?: any;
      generalSettings?: any;
    };
    createdAt: Date;
    updatedAt: Date;
  }>;

  // Donation level configurations
  @Prop({
    type: [{
      levelId: { type: String, required: true },
      levelName: { type: String, required: true },
      minAmount: { type: Number, required: true },
      maxAmount: { type: Number, required: true },
      currency: { type: String, default: 'VND' },
      isEnabled: { type: Boolean, default: true },
      configuration: {
        imageSettings: { type: Object },
        soundSettings: { type: Object },
        animationSettings: { type: Object },
        styleSettings: { type: Object },
        positionSettings: { type: Object },
        displaySettings: { type: Object },
        generalSettings: { type: Object },
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }],
    default: [],
  })
  donationLevels: Array<{
    levelId: string;
    levelName: string;
    minAmount: number;
    maxAmount: number;
    currency: string;
    isEnabled: boolean;
    configuration: {
      imageSettings?: any;
      soundSettings?: any;
      animationSettings?: any;
      styleSettings?: any;
      positionSettings?: any;
      displaySettings?: any;
      generalSettings?: any;
    };
    createdAt: Date;
    updatedAt: Date;
  }>;

  _id: string;
  createdAt: Date;
  updatedAt: Date;

  // Add toObject method for proper typing
  toObject(): any {
    return this;
  }
}

export const OBSSettingsSchema = SchemaFactory.createForClass(OBSSettings);

// Add virtual field for widgetUrl that always uses external IP
OBSSettingsSchema.virtual('widgetUrl').get(function() {
  return `http://14.225.211.248:3001/api/widget-public/alert/${this.streamerId}/${this.alertToken}`;
});

// Ensure virtual fields are included when converting to JSON
OBSSettingsSchema.set('toJSON', { virtuals: true });
OBSSettingsSchema.set('toObject', { virtuals: true });

// Create compound index for streamerId and isActive
OBSSettingsSchema.index({ streamerId: 1, isActive: 1 }); 