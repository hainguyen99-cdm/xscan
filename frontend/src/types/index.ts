// Core types for Donation Platform application

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string; // Added to match backend response
  lastName?: string; // Added to match backend response
  username: string; // Added to match backend response
  role: 'admin' | 'streamer' | 'donor';
  profilePicture?: string; // Changed from avatar to match backend API
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profilePublic: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Wallet {
  id: string;
  _id?: string; // MongoDB ObjectId
  userId: string;
  balance: number;
  currency: 'VND';
  isActive: boolean;
  transactionHistory: string[];
  lastTransactionAt?: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  _id?: string; // MongoDB ObjectId
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string;
  fee?: number;
  relatedWalletId?: string;
  metadata?: Record<string, any>;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DonationLink {
  id: string;
  _id?: string; // MongoDB ObjectId
  streamerId: string;
  slug: string;
  title: string;
  description?: string;
  customUrl: string;
  qrCodeUrl: string;
  isActive: boolean;
  isDefault?: boolean;
  allowAnonymous: boolean;
  totalDonations?: number;
  totalAmount?: number;
  currency?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DonationLinkFormData {
  title: string;
  description?: string;
  customUrl: string;
  isActive: boolean;
  allowAnonymous: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export interface Donation {
  id: string;
  donorId?: string; // null for anonymous donations
  streamerId: string;
  donationLinkId: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';
  createdAt: string;
  completedAt?: string;
}

// Notification types
export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
  donationConfirmations: boolean;
  streamerUpdates: boolean;
  securityAlerts: boolean;
  marketing: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'donation_confirmation' | 'streamer_update' | 'security_alert' | 'marketing' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  isEmailSent: boolean;
  isPushSent: boolean;
  createdAt: string;
  readAt?: string;
}

export interface DonationNotificationData {
  donationId: string;
  streamerName: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
}

export interface StreamerUpdateData {
  streamerId: string;
  streamerName: string;
  updateType: 'went_live' | 'ended_stream' | 'new_content' | 'milestone';
  data?: Record<string, any>;
}

export interface DonationLevel {
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
}

export interface OBSSettings {
  _id: string;
  streamerId: string;
  alertToken: string;
  widgetUrl: string;
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
  soundSettings: {
    enabled: boolean;
    url?: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    loop: boolean;
  };
  animationSettings: {
    enabled: boolean;
    animationType: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
    duration: number;
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    direction: 'left' | 'right' | 'top' | 'bottom';
    bounceIntensity: number;
    zoomScale: number;
  };
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
  positionSettings: {
    x: number;
    y: number;
    anchor: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    zIndex: number;
    responsive: boolean;
    mobileScale: number;
  };
  displaySettings: {
    duration: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    autoHide: boolean;
    showProgress: boolean;
    progressColor: string;
    progressHeight: number;
  };
  generalSettings: {
    enabled: boolean;
    maxAlerts: number;
    alertSpacing: number;
    cooldown: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  donationLevels?: DonationLevel[];
  isActive: boolean;
  settingsBehavior?: 'auto' | 'basic' | 'donation-levels';
  lastUsedAt?: string;
  totalAlerts: number;
  createdAt: string;
  updatedAt: string;
  // Legacy compatibility - map to new structure
  customization?: {
    image?: {
      url: string;
      type: 'image' | 'gif' | 'video';
      duration?: number;
    };
    sound?: {
      url: string;
      volume: number;
      duration?: number;
    };
    text?: {
      font: string;
      fontSize: number;
      color: string;
      backgroundColor?: string;
      animation?: 'fade' | 'slide' | 'bounce' | 'none';
    };
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    duration: number;
  };
}

export interface Scan {
  id: string;
  userId: string;
  type: 'qr' | 'barcode' | 'text';
  content: string;
  result: {
    type: 'url' | 'text' | 'contact' | 'email' | 'phone' | 'wifi' | 'location' | 'unknown';
    data: any;
    isValid: boolean;
    securityRisk?: 'low' | 'medium' | 'high';
  };
  metadata?: {
    deviceInfo?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    timestamp: string;
  };
  createdAt: string;
}

export interface Analytics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  topDonors: Array<{
    id: string;
    name: string;
    totalDonated: number;
    donationCount: number;
  }>;
  topStreamers: Array<{
    id: string;
    name: string;
    totalReceived: number;
    donationCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'donation' | 'withdrawal' | 'login' | 'security_alert';
    description: string;
    timestamp: string;
    amount?: number;
    currency?: string;
  }>;
  charts: {
    donationsOverTime: Array<{
      date: string;
      amount: number;
      count: number;
    }>;
    donationDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
}

export interface Report {
  id: string;
  title: string;
  type: 'donation_summary' | 'user_activity' | 'security_audit' | 'financial_report';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
  generatedBy: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface DonationForm {
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';
}

export interface OBSSettingsForm {
  alertToken?: string; // Made optional since it's read-only and managed by the backend
  customization: {
    image?: {
      url: string;
      type: 'image' | 'gif' | 'video';
      duration?: number;
    };
    sound?: {
      url: string;
      volume: number;
      duration?: number;
    };
    text?: {
      font: string;
      fontSize: number;
      color: string;
      backgroundColor?: string;
      animation?: 'fade' | 'slide' | 'bounce' | 'none';
    };
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    duration: number;
  };
}

// Theme types
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

// Error types
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'donation' | 'notification' | 'streamer_update' | 'security_alert';
  data: any;
  timestamp: string;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Streamer Registration types
export interface StreamerRegistrationForm {
  username: string;
  displayName: string;
  email: string;
  platform: string;
  channelUrl: string;
  description: string;
  monthlyViewers: number;
  contentCategory: string;
  reasonForApplying: string;
}

export interface StreamerApplication {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  platform: string;
  channelUrl: string;
  description: string;
  monthlyViewers: number;
  contentCategory: string;
  reasonForApplying: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

// Bank Account types
export interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isActive: boolean;
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountDto {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isDefault?: boolean;
}

export interface UpdateBankAccountDto {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface BankInfo {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export interface BankListResponse {
  code: string;
  desc: string;
  data: BankInfo[];
} 