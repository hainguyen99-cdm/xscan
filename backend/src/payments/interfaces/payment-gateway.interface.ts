export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  country?: string;
}

export interface PaymentGatewayInterface {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntent>;
  confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntent>;
  refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<PaymentIntent>;
  getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
  createPayout(
    amount: number,
    currency: string,
    destination: string,
    metadata?: Record<string, any>,
  ): Promise<any>;
}

export interface PaymentWebhookData {
  id: string;
  type: string;
  data: any;
  created: number;
}

export interface PaymentWebhookHandler {
  handleWebhook(event: PaymentWebhookData): Promise<void>;
}
