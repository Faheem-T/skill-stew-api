import { randomUUID } from "crypto";
import Stripe from "stripe";
import type { EventName, EventPayload } from "@skillstew/common";
import type {
  CreateCheckoutSessionDTO,
  StripeWebhookDTO,
} from "../dtos/payment.dto";
import type { IPaymentSessionService } from "../interfaces/IPaymentSessionService";
import type { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import type { IUnitOfWork } from "../ports/IUnitOfWork";
import { OutboxEvent } from "../../domain/entities/OutboxEvent";
import { Payment } from "../../domain/entities/Payment";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { ExternalServiceError } from "../errors/infra";

type PaymentTransition =
  | {
      payment: Payment;
      status: "SUCCEEDED";
      eventName: "payment.succeeded";
      occurredAt: string;
      stripePaymentIntentId: string | null;
    }
  | {
      payment: Payment;
      status: "FAILED";
      eventName: "payment.failed";
      occurredAt: string;
      stripePaymentIntentId: string | null;
    }
  | {
      payment: Payment;
      status: "REFUNDED";
      eventName: "payment.refunded";
      occurredAt: string;
      stripePaymentIntentId: string | null;
    };

export class PaymentSessionService implements IPaymentSessionService {
  constructor(
    private paymentRepo: IPaymentRepository,
    private outboxRepo: IOutboxEventRepository,
    private unitOfWork: IUnitOfWork,
    private stripe: Stripe,
    private stripeWebhookSecret: string,
    private checkoutReturnUrl: string,
  ) {}

  createCheckoutSession = async (input: CreateCheckoutSessionDTO) => {
    const existing = await this.paymentRepo.findByMembershipId(
      input.membershipId,
    );
    if (existing?.checkoutUrl && existing.status === "PENDING") {
      return {
        paymentId: existing.paymentId,
        checkoutSessionId: existing.stripeCheckoutSessionId ?? "",
        checkoutUrl: existing.checkoutUrl,
      };
    }

    if (existing && existing.status !== "PENDING") {
      throw new ValidationError([
        {
          message: "A payment already exists for this membership.",
          field: "membershipId",
        },
      ]);
    }

    const payment = new Payment(
      existing?.paymentId ?? randomUUID(),
      input.membershipId,
      input.userId,
      input.cohortId,
      input.workshopId,
      input.workshopTitle,
      input.expertId,
      input.amount,
      input.currency,
      "PENDING",
      null,
      null,
      null,
      existing?.createdAt ?? new Date(),
      new Date(),
    );

    if (!existing) {
      await this.paymentRepo.create(payment);
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: payment.membershipId,
        success_url: this.buildReturnUrl(
          payment,
          "success",
          "{CHECKOUT_SESSION_ID}",
        ),
        cancel_url: this.buildReturnUrl(payment, "cancelled"),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: payment.currency.toLowerCase(),
              unit_amount: payment.amount,
              product_data: {
                name: payment.workshopTitle,
              },
            },
          },
        ],
        metadata: this.buildMetadata(payment),
        payment_intent_data: {
          metadata: this.buildMetadata(payment),
        },
      });
    } catch (error) {
      if (!existing) {
        await this.paymentRepo.delete(payment.paymentId);
      }

      throw new ExternalServiceError(
        "Failed to create Stripe Checkout Session.",
        error instanceof Error ? error : undefined,
      );
    }

    const updatedPayment = new Payment(
      payment.paymentId,
      payment.membershipId,
      payment.userId,
      payment.cohortId,
      payment.workshopId,
      payment.workshopTitle,
      payment.expertId,
      payment.amount,
      payment.currency,
      payment.status,
      session.id,
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null,
      session.url ?? null,
      payment.createdAt,
      new Date(),
    );

    await this.paymentRepo.update(updatedPayment);

    if (
      !updatedPayment.checkoutUrl ||
      !updatedPayment.stripeCheckoutSessionId
    ) {
      throw new ExternalServiceError(
        "Stripe Checkout Session did not return a usable redirect URL.",
      );
    }

    return {
      paymentId: updatedPayment.paymentId,
      checkoutSessionId: updatedPayment.stripeCheckoutSessionId,
      checkoutUrl: updatedPayment.checkoutUrl,
    };
  };

  handleStripeWebhook = async ({
    signature,
    rawBody,
  }: StripeWebhookDTO): Promise<{ received: true }> => {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripeWebhookSecret,
      );
    } catch (error) {
      throw new ValidationError(
        [
          {
            message: "Invalid Stripe webhook signature.",
          },
        ],
        error instanceof Error ? error : undefined,
      );
    }

    const transition = await this.mapWebhookToTransition(event);
    if (!transition) {
      return { received: true };
    }

    const nextPayment = new Payment(
      transition.payment.paymentId,
      transition.payment.membershipId,
      transition.payment.userId,
      transition.payment.cohortId,
      transition.payment.workshopId,
      transition.payment.workshopTitle,
      transition.payment.expertId,
      transition.payment.amount,
      transition.payment.currency,
      transition.status,
      transition.payment.stripeCheckoutSessionId,
      transition.stripePaymentIntentId ??
        transition.payment.stripePaymentIntentId,
      transition.payment.checkoutUrl,
      transition.payment.createdAt,
      new Date(),
    );

    await this.unitOfWork.transact(async (tx) => {
      await this.paymentRepo.update(nextPayment, tx);
      await this.outboxRepo.create(
        this.createOutboxEvent(transition.eventName, {
          membershipId: nextPayment.membershipId,
          paymentId: nextPayment.paymentId,
          userId: nextPayment.userId,
          occurredAt: transition.occurredAt,
        }),
        tx,
      );
    });

    return { received: true };
  };

  private buildMetadata(payment: Payment): Record<string, string> {
    return {
      paymentId: payment.paymentId,
      membershipId: payment.membershipId,
      userId: payment.userId,
      cohortId: payment.cohortId,
      workshopId: payment.workshopId,
      workshopTitle: payment.workshopTitle,
      expertId: payment.expertId,
    };
  }

  private buildReturnUrl(
    payment: Payment,
    status: "success" | "cancelled",
    sessionId?: string,
  ): string {
    const url = new URL(this.checkoutReturnUrl);
    url.searchParams.set("paymentStatus", status);
    url.searchParams.set("paymentId", payment.paymentId);
    url.searchParams.set("membershipId", payment.membershipId);
    url.searchParams.set("cohortId", payment.cohortId);
    url.searchParams.set("workshopId", payment.workshopId);
    if (sessionId) {
      url.searchParams.set("session_id", sessionId);
    }
    return url.toString();
  }

  private createOutboxEvent<T extends EventName>(
    eventName: T,
    payload: EventPayload<T>,
  ): OutboxEvent {
    return new OutboxEvent(
      randomUUID(),
      eventName,
      payload,
      "PENDING",
      new Date(),
      undefined,
    );
  }

  private async mapWebhookToTransition(
    event: Stripe.Event,
  ): Promise<PaymentTransition | null> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status !== "paid") {
          return null;
        }

        const payment = await this.getPaymentByCheckoutSessionId(session.id);
        if (payment.status === "SUCCEEDED" || payment.status === "REFUNDED") {
          return null;
        }

        return {
          payment,
          status: "SUCCEEDED",
          eventName: "payment.succeeded",
          occurredAt: new Date(event.created * 1000).toISOString(),
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : payment.stripePaymentIntentId,
        };
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const payment = await this.getPaymentByCheckoutSessionId(session.id);
        if (payment.status !== "PENDING") {
          return null;
        }

        return {
          payment,
          status: "FAILED",
          eventName: "payment.failed",
          occurredAt: new Date(event.created * 1000).toISOString(),
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : payment.stripePaymentIntentId,
        };
      }

      case "charge.refunded": {
        const charge = event.data.object;
        if (!charge.refunded || typeof charge.payment_intent !== "string") {
          return null;
        }

        const payment = await this.getPaymentByPaymentIntentId(
          charge.payment_intent,
        );
        if (payment.status === "REFUNDED") {
          return null;
        }

        return {
          payment,
          status: "REFUNDED",
          eventName: "payment.refunded",
          occurredAt: new Date(event.created * 1000).toISOString(),
          stripePaymentIntentId: charge.payment_intent,
        };
      }

      default:
        return null;
    }
  }

  private async getPaymentByCheckoutSessionId(
    checkoutSessionId: string,
  ): Promise<Payment> {
    const payment =
      await this.paymentRepo.findByCheckoutSessionId(checkoutSessionId);

    if (!payment) {
      throw new NotFoundError("Payment");
    }

    return payment;
  }

  private async getPaymentByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Payment> {
    const payment =
      await this.paymentRepo.findByPaymentIntentId(paymentIntentId);

    if (!payment) {
      throw new NotFoundError("Payment");
    }

    return payment;
  }
}
