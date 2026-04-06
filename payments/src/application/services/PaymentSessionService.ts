import { randomUUID } from "crypto";
import { Channel } from "amqplib";
import type {
  CreateCheckoutSessionDTO,
  PublishPaymentOutcomeDTO,
} from "../dtos/payment.dto";
import type { IPaymentSessionService } from "../interfaces/IPaymentSessionService";
import { ExternalServiceError } from "../errors/infra";

type StoredPayment = {
  paymentId: string;
  checkoutSessionId: string;
  membershipId: string;
  userId: string;
  amount: number;
  currency: string;
};

export class PaymentSessionService implements IPaymentSessionService {
  private sessionsByMembershipId = new Map<string, StoredPayment>();

  constructor(
    private channel: Channel,
    private exchangeName: string,
  ) {}

  createCheckoutSession = async (input: CreateCheckoutSessionDTO) => {
    const existing = this.sessionsByMembershipId.get(input.membershipId);
    if (existing) {
      return {
        paymentId: existing.paymentId,
        checkoutSessionId: existing.checkoutSessionId,
        checkoutUrl: `/mock-checkout/${existing.checkoutSessionId}`,
      };
    }

    const paymentId = randomUUID();
    const checkoutSessionId = randomUUID();
    this.sessionsByMembershipId.set(input.membershipId, {
      paymentId,
      checkoutSessionId,
      membershipId: input.membershipId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
    });

    return {
      paymentId,
      checkoutSessionId,
      checkoutUrl: `/mock-checkout/${checkoutSessionId}`,
    };
  };

  publishOutcome = async ({
    membershipId,
    paymentId,
    userId,
    status,
  }: PublishPaymentOutcomeDTO): Promise<{ published: true }> => {
    const payment = this.sessionsByMembershipId.get(membershipId);
    if (!payment || payment.paymentId !== paymentId) {
      throw new ExternalServiceError(
        "No matching payment checkout session exists for this membership.",
      );
    }

    const eventName = `payment.${status}`;
    const event = {
      eventId: randomUUID(),
      eventName,
      timestamp: new Date().toISOString(),
      producer: "payments-service",
      data: {
        membershipId,
        paymentId,
        userId,
        occurredAt: new Date().toISOString(),
      },
    };

    this.channel.publish(
      this.exchangeName,
      eventName,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );

    return { published: true };
  };
}
