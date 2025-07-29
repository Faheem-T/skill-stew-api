import { NextFunction, Request, Response } from "express-serve-static-core";
import { SubscriptionPlansUsecases } from "../../application/SubscriptionPlansUsecases";
import {
  createSubscriptionPlanSchema,
  editSubscriptionPlanSchema,
} from "../../application/dtos/SubscriptionPlansDtos";
import { HttpStatus } from "@skillstew/common";

export class SubscriptionPlansController {
  constructor(private _plansUsecases: SubscriptionPlansUsecases) {}

  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createSubscriptionPlanSchema.parse(req.body);
      await this._plansUsecases.createPlan(dto);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Plan has been created" });
    } catch (err) {
      next(err);
    }
  };

  getPlans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this._plansUsecases.getPlans();
      res.status(HttpStatus.OK).json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  };

  editPlan = async (
    req: Request<{ id?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = editSubscriptionPlanSchema.parse(req.body);
      console.log(req.params.id);
      const id = req.params.id?.trim();
      if (!id) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "id is required" });
        return;
      }
      const updatedPlan = await this._plansUsecases.editPlan(id, dto);
      if (!updatedPlan) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "Plan not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedPlan });
    } catch (err) {
      next(err);
    }
  };
}
