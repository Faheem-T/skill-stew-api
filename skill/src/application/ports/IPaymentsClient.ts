export interface CreateCheckoutSessionInput {
  membershipId: string;
  cohortId: string;
  workshopId: string;
  expertId: string;
  userId: string;
  amount: number;
  currency: string;
}

export interface CheckoutSessionResponse {
  paymentId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface IPaymentsClient {
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResponse>;
}
