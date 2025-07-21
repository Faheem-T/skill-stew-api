import { NextFunction, Request, Response } from "express-serve-static-core";
import { SubscriptionPlansUsecases } from "../../application/SubscriptionPlansUsecases";
import { createSubscriptionPlanSchema } from "../../application/dtos/SubscriptionPlansDtos";
import { HttpStatus } from "@skillstew/common";

export class SubscriptionPlansController {
  constructor(private _plansUsecases: SubscriptionPlansUsecases) {}
  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    const dto = createSubscriptionPlanSchema.parse(req.body);
    await this._plansUsecases.createPlan(dto);
    res.status(HttpStatus.OK);
  };
}
