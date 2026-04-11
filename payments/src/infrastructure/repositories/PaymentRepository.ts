import { eq } from "drizzle-orm";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { paymentsTable } from "../db/schemas/paymentSchema";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import { Payment } from "../../domain/entities/Payment";
import type { TransactionContext } from "../../types/TransactionContext";
import { db } from "../../start";

export class PaymentRepository implements IPaymentRepository {
  async create(payment: Payment, tx?: TransactionContext): Promise<void> {
    const runner = tx ?? db;

    try {
      await runner.insert(paymentsTable).values({
        payment_id: payment.paymentId,
        membership_id: payment.membershipId,
        user_id: payment.userId,
        cohort_id: payment.cohortId,
        workshop_id: payment.workshopId,
        workshop_title: payment.workshopTitle,
        expert_id: payment.expertId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        stripe_checkout_session_id: payment.stripeCheckoutSessionId,
        stripe_payment_intent_id: payment.stripePaymentIntentId,
        checkout_url: payment.checkoutUrl,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
      });
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async update(payment: Payment, tx?: TransactionContext): Promise<void> {
    const runner = tx ?? db;

    try {
      await runner
        .update(paymentsTable)
        .set({
          membership_id: payment.membershipId,
          user_id: payment.userId,
          cohort_id: payment.cohortId,
          workshop_id: payment.workshopId,
          workshop_title: payment.workshopTitle,
          expert_id: payment.expertId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          stripe_checkout_session_id: payment.stripeCheckoutSessionId,
          stripe_payment_intent_id: payment.stripePaymentIntentId,
          checkout_url: payment.checkoutUrl,
          updated_at: payment.updatedAt,
        })
        .where(eq(paymentsTable.payment_id, payment.paymentId));
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async delete(paymentId: string, tx?: TransactionContext): Promise<void> {
    const runner = tx ?? db;

    try {
      await runner
        .delete(paymentsTable)
        .where(eq(paymentsTable.payment_id, paymentId));
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async findByMembershipId(
    membershipId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null> {
    const runner = tx ?? db;

    try {
      const rows = await runner
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.membership_id, membershipId))
        .limit(1);

      return rows[0] ? this.toDomain(rows[0]) : null;
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async findByPaymentId(
    paymentId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null> {
    const runner = tx ?? db;

    try {
      const rows = await runner
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.payment_id, paymentId))
        .limit(1);

      return rows[0] ? this.toDomain(rows[0]) : null;
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async findByCheckoutSessionId(
    checkoutSessionId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null> {
    const runner = tx ?? db;

    try {
      const rows = await runner
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.stripe_checkout_session_id, checkoutSessionId))
        .limit(1);

      return rows[0] ? this.toDomain(rows[0]) : null;
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null> {
    const runner = tx ?? db;

    try {
      const rows = await runner
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.stripe_payment_intent_id, paymentIntentId))
        .limit(1);

      return rows[0] ? this.toDomain(rows[0]) : null;
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }

  private toDomain(row: typeof paymentsTable.$inferSelect): Payment {
    return new Payment(
      row.payment_id,
      row.membership_id,
      row.user_id,
      row.cohort_id,
      row.workshop_id,
      row.workshop_title,
      row.expert_id,
      row.amount,
      row.currency,
      row.status,
      row.stripe_checkout_session_id ?? null,
      row.stripe_payment_intent_id ?? null,
      row.checkout_url ?? null,
      row.created_at,
      row.updated_at,
    );
  }
}
