import type { NextFunction, Request, Response } from "express";
import {
  createCheckoutSessionDTO,
} from "../../application/dtos/payment.dto";
import type { IPaymentSessionService } from "../../application/interfaces/IPaymentSessionService";
import { ValidationError } from "../../application/errors/ValidationError";

export class PaymentSessionController {
  constructor(private paymentSessionService: IPaymentSessionService) {}

  createCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = createCheckoutSessionDTO.parse(req.body);
      const session =
        await this.paymentSessionService.createCheckoutSession(dto);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  };

  handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        throw new ValidationError([
          { message: "Missing Stripe signature header." },
        ]);
      }

      const result = await this.paymentSessionService.handleStripeWebhook({
        signature,
        rawBody: Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from(req.body as string),
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
