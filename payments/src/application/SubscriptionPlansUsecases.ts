import { SubscriptionPlan } from "../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../domain/repositories/ISubscriptionPlansRepository";
import {
  CreateSubscriptionPlanDto,
  EditSubscriptionPlanDto,
} from "./dtos/SubscriptionPlansDtos";

export class SubscriptionPlansUsecases {
  constructor(private _plansRepo: ISubscriptionPlansRepository) {}
  createPlan = async (dto: CreateSubscriptionPlanDto) => {
    const { name, yearlyPrice, monthlyPrice, currency, freeWorkshopHours } =
      dto;
    const plan = new SubscriptionPlan({
      name,
      price: { monthly: monthlyPrice, yearly: yearlyPrice, currency },
      freeWorkshopHours,
    });

    await this._plansRepo.save(plan);
  };

  getPlans = async () => {
    return this._plansRepo.getAllPlans();
  };

  editPlan = async (id: string, dto: EditSubscriptionPlanDto) => {
    return this._plansRepo.update(id, dto);
  };
}
