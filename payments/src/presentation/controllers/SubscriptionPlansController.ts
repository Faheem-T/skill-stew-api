import { NextFunction, Request, Response } from "express-serve-static-core";
import { ISubscriptionPlansUsecases } from "../../application/interfaces/ISubscriptionPlansUsecases";
import {
  createSubscriptionPlanSchema,
  editSubscriptionPlanSchema,
} from "../../application/dtos/SubscriptionPlansDtos";
import { HttpStatus } from "@skillstew/common";

export class SubscriptionPlansController {
  constructor(private _plansUsecases: ISubscriptionPlansUsecases) {}

  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createSubscriptionPlanSchema.parse(req.body);
      const plan = await this._plansUsecases.createPlan(dto);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Plan has been created", data: plan });
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
      res.status(HttpStatus.OK).json({
        success: true,
        data: updatedPlan,
        message: "Plan has been updated",
      });
    } catch (err) {
      next(err);
    }
  };

  deletePlan = async (
    req: Request<{ id?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.params.id?.trim();
      if (!id) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "id is required" });
        return;
      }
      const deletedPlan = await this._plansUsecases.deletePlan(id);
      if (!deletedPlan) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "Plan not found" });
        return;
      }
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Plan has been deleted",
      });
    } catch (err) {
      next(err);
    }
  };
}
