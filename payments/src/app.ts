import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { paymentSessionController } from "./di";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { httpLogger } from "./presentation/middlewares/httpLogger";
import { internalPaymentRouter } from "./presentation/routes/internalPaymentRoutes";

const app = express();

app.use(httpLogger);

app.post(
  "/api/v1/payments/webhooks/stripe",
  express.raw({ type: "application/json" }),
  paymentSessionController.handleStripeWebhook,
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/internal/payments", internalPaymentRouter);

app.use(errorHandler);

export { app };
