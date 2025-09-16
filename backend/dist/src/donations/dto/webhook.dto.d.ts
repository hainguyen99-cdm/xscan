export declare class WebhookPayloadDto {
    id: string;
    type: string;
    data: any;
    created: number;
    signature?: string;
}
export declare class StripeWebhookDto {
    'stripe-signature': string;
    body: any;
}
export declare class PayPalWebhookDto {
    'paypal-signature': string;
    body: any;
}
export declare class CustomWebhookDto {
    'x-signature': string;
    body: any;
}
export declare class DonationWebhookDataDto {
    donationId: string;
    donor: {
        name?: string;
        email?: string;
        isAnonymous: boolean;
    };
    streamerId: string;
    amount: number;
    currency: string;
    message?: string;
    status: string;
    metadata?: Record<string, any>;
}
export declare class WebhookResponseDto {
    success: boolean;
    message: string;
    data?: any;
    timestamp?: string;
}
export declare class WebhookStatsDto {
    totalWebhooks: number;
    successfulWebhooks: number;
    failedWebhooks: number;
    averageProcessingTime: number;
    lastWebhookProcessed: string;
}
