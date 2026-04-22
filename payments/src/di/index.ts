import Stripe from "stripe";
import { ENV } from "../config/dotenv";
import { PaymentSessionService } from "../application/services/PaymentSessionService";
import { PaymentSessionController } from "../presentation/controllers/PaymentSessionController";
import { PaymentRepository } from "../infrastructure/repositories/PaymentRepository";
import { OutboxEventRepository } from "../infrastructure/repositories/OutboxEventRepository";
import { UnitOfWork } from "../infrastructure/persistence/UnitOfWork";

const paymentRepo = new PaymentRepository();
const outboxRepo = new OutboxEventRepository();
const unitOfWork = new UnitOfWork();
const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia" as never,
});

const paymentSessionService = new PaymentSessionService(
  paymentRepo,
  outboxRepo,
  unitOfWork,
  stripe,
  ENV.STRIPE_WEBHOOK_SECRET,
  ENV.FRONTEND_PAYMENT_RETURN_URL,
);

export const paymentSessionController = new PaymentSessionController(
  paymentSessionService,
);
