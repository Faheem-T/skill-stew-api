import { Router } from "express";
import { paymentSessionController } from "../../di";

export const internalPaymentRouter = Router()
  .post("/checkout-sessions", paymentSessionController.createCheckoutSession)
  .post("/outcomes", paymentSessionController.publishOutcome);
