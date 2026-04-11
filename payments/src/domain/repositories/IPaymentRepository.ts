import type { TransactionContext } from "../../types/TransactionContext";
import type { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  create(payment: Payment, tx?: TransactionContext): Promise<void>;
  update(payment: Payment, tx?: TransactionContext): Promise<void>;
  delete(paymentId: string, tx?: TransactionContext): Promise<void>;
  findByMembershipId(
    membershipId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null>;
  findByPaymentId(
    paymentId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null>;
  findByCheckoutSessionId(
    checkoutSessionId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null>;
  findByPaymentIntentId(
    paymentIntentId: string,
    tx?: TransactionContext,
  ): Promise<Payment | null>;
}
