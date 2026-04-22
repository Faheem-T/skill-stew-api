import type { PaymentStatus } from "./PaymentStatus.enum";

export class Payment {
  constructor(
    public paymentId: string,
    public membershipId: string,
    public userId: string,
    public cohortId: string,
    public workshopId: string,
    public workshopTitle: string,
    public expertId: string,
    public amount: number,
    public currency: string,
    public status: PaymentStatus,
    public stripeCheckoutSessionId: string | null,
    public stripePaymentIntentId: string | null,
    public checkoutUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
