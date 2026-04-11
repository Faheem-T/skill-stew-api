import type {
  CreateCheckoutSessionDTO,
  StripeWebhookDTO,
} from "../dtos/payment.dto";

export interface IPaymentSessionService {
  createCheckoutSession(input: CreateCheckoutSessionDTO): Promise<{
    paymentId: string;
    checkoutSessionId: string;
    checkoutUrl: string;
  }>;
  handleStripeWebhook(input: StripeWebhookDTO): Promise<{ received: true }>;
}
