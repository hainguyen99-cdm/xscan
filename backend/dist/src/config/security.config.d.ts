declare const _default: (() => {
    ssl: {
        enabled: boolean;
        keyPath: string;
        certPath: string;
        caPath: string;
        minTlsVersion: string;
    };
    rateLimit: {
        enabled: boolean;
        default: {
            maxRequests: number;
            windowSeconds: number;
        };
        auth: {
            maxRequests: number;
            windowSeconds: number;
        };
        donations: {
            maxRequests: number;
            windowSeconds: number;
        };
        payments: {
            maxRequests: number;
            windowSeconds: number;
        };
        uploads: {
            maxRequests: number;
            windowSeconds: number;
        };
    };
    csp: {
        enabled: boolean;
        directives: {
            'default-src': string[];
            'script-src': string[];
            'style-src': string[];
            'font-src': string[];
            'img-src': string[];
            'connect-src': string[];
            'frame-src': string[];
            'object-src': string[];
            'base-uri': string[];
            'form-action': string[];
            'frame-ancestors': string[];
            'upgrade-insecure-requests': any[];
        };
    };
    headers: {
        hsts: {
            enabled: boolean;
            maxAge: number;
            includeSubDomains: boolean;
            preload: boolean;
        };
        permissionsPolicy: {
            enabled: boolean;
            policies: string[];
        };
    };
    pci: {
        enabled: boolean;
        version: string;
        requirements: {
            'Build and Maintain a Secure Network': boolean;
            'Protect Cardholder Data': boolean;
            'Maintain Vulnerability Management Program': boolean;
            'Implement Strong Access Control': boolean;
            'Monitor and Test Networks': boolean;
            'Maintain Information Security Policy': boolean;
        };
        cardValidation: {
            enabled: boolean;
            luhnCheck: boolean;
            cardTypeDetection: boolean;
            expiryValidation: boolean;
            cvvValidation: boolean;
        };
        tokenization: {
            enabled: boolean;
            algorithm: string;
            keyRotation: boolean;
            secureStorage: boolean;
        };
    };
    gdpr: {
        enabled: boolean;
        version: string;
        requirements: {
            'Lawful Basis for Processing': boolean;
            'Data Subject Rights': boolean;
            'Data Protection by Design': boolean;
            'Data Breach Notification': boolean;
            'Data Protection Officer': boolean;
            'International Transfers': boolean;
        };
        consent: {
            required: boolean;
            explicit: boolean;
            granular: boolean;
            withdrawable: boolean;
            documented: boolean;
        };
        dataRetention: {
            userData: number;
            financialRecords: number;
            auditLogs: number;
        };
        userRights: string[];
    };
    contentScanning: {
        enabled: boolean;
        fileTypes: {
            images: string[];
            videos: string[];
            audio: string[];
            documents: string[];
        };
        maxFileSize: number;
        quarantine: {
            enabled: boolean;
            directory: string;
            autoCleanup: boolean;
            cleanupInterval: number;
        };
        threats: {
            malware: boolean;
            steganography: boolean;
            embeddedScripts: boolean;
            pathTraversal: boolean;
            oversizedFiles: boolean;
        };
    };
    tokenization: {
        enabled: boolean;
        algorithm: string;
        keyLength: number;
        ivLength: number;
        tagLength: number;
        jwt: {
            algorithm: string;
            expiresIn: {
                session: number;
                widget: number;
                donation: number;
                payment: number;
            };
        };
    };
    logging: {
        securityEvents: boolean;
        rateLimitViolations: boolean;
        fileScans: boolean;
        tokenOperations: boolean;
        pciOperations: boolean;
        gdprOperations: boolean;
        level: string;
    };
    environment: {
        development: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
        };
        production: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
            csp: {
                strict: boolean;
            };
        };
        testing: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    ssl: {
        enabled: boolean;
        keyPath: string;
        certPath: string;
        caPath: string;
        minTlsVersion: string;
    };
    rateLimit: {
        enabled: boolean;
        default: {
            maxRequests: number;
            windowSeconds: number;
        };
        auth: {
            maxRequests: number;
            windowSeconds: number;
        };
        donations: {
            maxRequests: number;
            windowSeconds: number;
        };
        payments: {
            maxRequests: number;
            windowSeconds: number;
        };
        uploads: {
            maxRequests: number;
            windowSeconds: number;
        };
    };
    csp: {
        enabled: boolean;
        directives: {
            'default-src': string[];
            'script-src': string[];
            'style-src': string[];
            'font-src': string[];
            'img-src': string[];
            'connect-src': string[];
            'frame-src': string[];
            'object-src': string[];
            'base-uri': string[];
            'form-action': string[];
            'frame-ancestors': string[];
            'upgrade-insecure-requests': any[];
        };
    };
    headers: {
        hsts: {
            enabled: boolean;
            maxAge: number;
            includeSubDomains: boolean;
            preload: boolean;
        };
        permissionsPolicy: {
            enabled: boolean;
            policies: string[];
        };
    };
    pci: {
        enabled: boolean;
        version: string;
        requirements: {
            'Build and Maintain a Secure Network': boolean;
            'Protect Cardholder Data': boolean;
            'Maintain Vulnerability Management Program': boolean;
            'Implement Strong Access Control': boolean;
            'Monitor and Test Networks': boolean;
            'Maintain Information Security Policy': boolean;
        };
        cardValidation: {
            enabled: boolean;
            luhnCheck: boolean;
            cardTypeDetection: boolean;
            expiryValidation: boolean;
            cvvValidation: boolean;
        };
        tokenization: {
            enabled: boolean;
            algorithm: string;
            keyRotation: boolean;
            secureStorage: boolean;
        };
    };
    gdpr: {
        enabled: boolean;
        version: string;
        requirements: {
            'Lawful Basis for Processing': boolean;
            'Data Subject Rights': boolean;
            'Data Protection by Design': boolean;
            'Data Breach Notification': boolean;
            'Data Protection Officer': boolean;
            'International Transfers': boolean;
        };
        consent: {
            required: boolean;
            explicit: boolean;
            granular: boolean;
            withdrawable: boolean;
            documented: boolean;
        };
        dataRetention: {
            userData: number;
            financialRecords: number;
            auditLogs: number;
        };
        userRights: string[];
    };
    contentScanning: {
        enabled: boolean;
        fileTypes: {
            images: string[];
            videos: string[];
            audio: string[];
            documents: string[];
        };
        maxFileSize: number;
        quarantine: {
            enabled: boolean;
            directory: string;
            autoCleanup: boolean;
            cleanupInterval: number;
        };
        threats: {
            malware: boolean;
            steganography: boolean;
            embeddedScripts: boolean;
            pathTraversal: boolean;
            oversizedFiles: boolean;
        };
    };
    tokenization: {
        enabled: boolean;
        algorithm: string;
        keyLength: number;
        ivLength: number;
        tagLength: number;
        jwt: {
            algorithm: string;
            expiresIn: {
                session: number;
                widget: number;
                donation: number;
                payment: number;
            };
        };
    };
    logging: {
        securityEvents: boolean;
        rateLimitViolations: boolean;
        fileScans: boolean;
        tokenOperations: boolean;
        pciOperations: boolean;
        gdprOperations: boolean;
        level: string;
    };
    environment: {
        development: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
        };
        production: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
            csp: {
                strict: boolean;
            };
        };
        testing: {
            ssl: {
                enabled: boolean;
            };
            rateLimit: {
                enabled: boolean;
            };
            logging: {
                level: string;
            };
        };
    };
}>;
export default _default;
