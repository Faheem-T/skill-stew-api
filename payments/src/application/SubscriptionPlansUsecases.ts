import { SubscriptionPlan } from "../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../domain/repositories/ISubscriptionPlansRepository";
import { CreateSubscriptionPlanDto } from "./dtos/SubscriptionPlansDtos";

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
}
