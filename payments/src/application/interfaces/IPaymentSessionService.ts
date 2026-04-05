import type {
  CreateCheckoutSessionDTO,
  PublishPaymentOutcomeDTO,
} from "../dtos/payment.dto";

export interface IPaymentSessionService {
  createCheckoutSession(input: CreateCheckoutSessionDTO): Promise<{
    paymentId: string;
    checkoutSessionId: string;
    checkoutUrl: string;
  }>;
  publishOutcome(
    input: PublishPaymentOutcomeDTO,
  ): Promise<{ published: true }>;
}
