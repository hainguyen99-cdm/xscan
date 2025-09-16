export declare class PaymentWebhookDto {
    id: string;
    type: string;
    data: any;
    created: number;
    provider?: string;
    metadata?: Record<string, any>;
}
