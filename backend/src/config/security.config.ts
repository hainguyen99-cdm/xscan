import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // SSL/TLS Configuration
  ssl: {
    enabled: process.env.NODE_ENV === 'production',
    keyPath: process.env.SSL_KEY_PATH || 'ssl/private.key',
    certPath: process.env.SSL_CERT_PATH || 'ssl/certificate.crt',
    caPath: process.env.SSL_CA_PATH || 'ssl/ca_bundle.crt',
    minTlsVersion: process.env.MIN_TLS_VERSION || 'TLSv1.2',
  },

  // Rate Limiting Configuration
  rateLimit: {
    enabled: true,
    default: {
      maxRequests: parseInt(process.env.RATE_LIMIT_DEFAULT_MAX, 10) || 100,
      windowSeconds: parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW, 10) || 60,
    },
    auth: {
      maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
      windowSeconds: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW, 10) || 300,
    },
    donations: {
      maxRequests: parseInt(process.env.RATE_LIMIT_DONATIONS_MAX, 10) || 10,
      windowSeconds: parseInt(process.env.RATE_LIMIT_DONATIONS_WINDOW, 10) || 60,
    },
    payments: {
      maxRequests: parseInt(process.env.RATE_LIMIT_PAYMENTS_MAX, 10) || 20,
      windowSeconds: parseInt(process.env.RATE_LIT_PAYMENTS_WINDOW, 10) || 300,
    },
    uploads: {
      maxRequests: parseInt(process.env.RATE_LIMIT_UPLOADS_MAX, 10) || 5,
      windowSeconds: parseInt(process.env.RATE_LIMIT_UPLOADS_WINDOW, 10) || 60,
    },
  },

  // Content Security Policy
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://js.stripe.com',
        'https://www.paypal.com',
        'https://www.google-analytics.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
        'https://www.google-analytics.com'
      ],
      'connect-src': [
        "'self'",
        'https://api.stripe.com',
        'https://api.paypal.com',
        'https://www.google-analytics.com',
        'wss:',
        'ws:'
      ],
      'frame-src': [
        "'self'",
        'https://js.stripe.com',
        'https://www.paypal.com',
        'https://www.google-analytics.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : undefined,
    },
  },

  // Security Headers
  headers: {
    hsts: {
      enabled: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000,
      includeSubDomains: true,
      preload: true,
    },
    permissionsPolicy: {
      enabled: true,
      policies: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=()',
        'gamepad=()',
        'hid=()',
        'idle-detection=()',
        'local-fonts=()',
        'midi=()',
        'navigation-override=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'serial=()',
        'speaker-selection=()',
        'sync-xhr=()',
        'trust-token-redemption=()',
        'web-share=()',
        'xr-spatial-tracking=()',
      ],
    },
  },

  // PCI DSS Compliance
  pci: {
    enabled: true,
    version: '4.0',
    requirements: {
      'Build and Maintain a Secure Network': true,
      'Protect Cardholder Data': true,
      'Maintain Vulnerability Management Program': true,
      'Implement Strong Access Control': true,
      'Monitor and Test Networks': true,
      'Maintain Information Security Policy': true,
    },
    cardValidation: {
      enabled: true,
      luhnCheck: true,
      cardTypeDetection: true,
      expiryValidation: true,
      cvvValidation: true,
    },
    tokenization: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: true,
      secureStorage: true,
    },
  },

  // GDPR Compliance
  gdpr: {
    enabled: true,
    version: '2018',
    requirements: {
      'Lawful Basis for Processing': true,
      'Data Subject Rights': true,
      'Data Protection by Design': true,
      'Data Breach Notification': true,
      'Data Protection Officer': true,
      'International Transfers': true,
    },
    consent: {
      required: true,
      explicit: true,
      granular: true,
      withdrawable: true,
      documented: true,
    },
    dataRetention: {
      userData: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      financialRecords: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      auditLogs: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
    },
    userRights: [
      'Access',
      'Rectification',
      'Erasure',
      'Portability',
      'Restriction',
      'Objection',
      'Automated Decision Making',
    ],
  },

  // Content Scanning
  contentScanning: {
    enabled: true,
    fileTypes: {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      videos: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
      audio: ['mp3', 'wav', 'ogg', 'aac'],
      documents: ['pdf', 'doc', 'docx', 'txt'],
    },
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    quarantine: {
      enabled: true,
      directory: 'uploads/quarantine',
      autoCleanup: true,
      cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
    },
    threats: {
      malware: true,
      steganography: true,
      embeddedScripts: true,
      pathTraversal: true,
      oversizedFiles: true,
    },
  },

  // Tokenization and Encryption
  tokenization: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    jwt: {
      algorithm: 'HS256',
      expiresIn: {
        session: 60 * 60, // 1 hour
        widget: 24 * 60 * 60, // 24 hours
        donation: 7 * 24 * 60 * 60, // 7 days
        payment: 15 * 60, // 15 minutes
      },
    },
  },

  // Logging and Monitoring
  logging: {
    securityEvents: true,
    rateLimitViolations: true,
    fileScans: true,
    tokenOperations: true,
    pciOperations: true,
    gdprOperations: true,
    level: process.env.SECURITY_LOG_LEVEL || 'info',
  },

  // Environment-specific overrides
  environment: {
    development: {
      ssl: { enabled: false },
      rateLimit: { enabled: false },
      logging: { level: 'debug' },
    },
    production: {
      ssl: { enabled: true },
      rateLimit: { enabled: true },
      logging: { level: 'warn' },
      csp: { strict: true },
    },
    testing: {
      ssl: { enabled: false },
      rateLimit: { enabled: false },
      logging: { level: 'error' },
    },
  },
})); 