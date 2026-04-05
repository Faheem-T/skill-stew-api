import type { NextFunction, Request, Response } from "express";
import {
  createCheckoutSessionDTO,
  publishPaymentOutcomeDTO,
} from "../../application/dtos/payment.dto";
import type { IPaymentSessionService } from "../../application/interfaces/IPaymentSessionService";

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

  publishOutcome = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = publishPaymentOutcomeDTO.parse(req.body);
      const result = await this.paymentSessionService.publishOutcome(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
