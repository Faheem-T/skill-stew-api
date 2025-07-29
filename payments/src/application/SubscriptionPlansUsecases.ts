import { SubscriptionPlan } from "../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../domain/repositories/ISubscriptionPlansRepository";
import {
  CreateSubscriptionPlanDto,
  EditSubscriptionPlanDto,
} from "./dtos/SubscriptionPlansDtos";

export class SubscriptionPlansUsecases {
  constructor(private _plansRepo: ISubscriptionPlansRepository) {}
  createPlan = async (dto: CreateSubscriptionPlanDto) => {
    const {
      name,
      yearlyPrice,
      monthlyPrice,
      currency,
      freeWorkshopHours,
      description,
      features,
      active,
    } = dto;
    const plan = new SubscriptionPlan({
      name,
      description,
      price: { monthly: monthlyPrice, yearly: yearlyPrice, currency },
      freeWorkshopHours,
      features,
      active,
    });

    return this._plansRepo.save(plan);
  };

  getPlans = async () => {
    return this._plansRepo.getAllPlans();
  };

  editPlan = async (id: string, dto: EditSubscriptionPlanDto) => {
    return this._plansRepo.update(id, dto);
  };

  deletePlan = async (id: string) => {
    return this._plansRepo.delete(id);
  };
}
