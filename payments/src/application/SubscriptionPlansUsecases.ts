import { SubscriptionPlan } from "../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../domain/repositories/ISubscriptionPlansRepository";
import {
  CreateSubscriptionPlanDto,
  EditSubscriptionPlanDto,
} from "./dtos/SubscriptionPlansDtos";
import { ISubscriptionPlansUsecases } from "./interfaces/ISubscriptionPlansUsecases";
import { SubscriptionPlansDTOMapper } from "./mapper/SubscriptionPlansDTOMapper";

export class SubscriptionPlansUsecases implements ISubscriptionPlansUsecases {
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

    const savedPlan = await this._plansRepo.save(plan);
    if (!savedPlan) return null;
    return SubscriptionPlansDTOMapper.toPresentation(savedPlan);
  };

  getPlans = async () => {
    const plans = await this._plansRepo.getAllPlans();
    return plans.map(SubscriptionPlansDTOMapper.toPresentation);
  };

  editPlan = async (id: string, dto: EditSubscriptionPlanDto) => {
    const editedPlan = await this._plansRepo.update(id, dto);
    if (!editedPlan) return null;
    return SubscriptionPlansDTOMapper.toPresentation(editedPlan);
  };

  deletePlan = async (id: string) => {
    const deletedPlan = await this._plansRepo.delete(id);
    if (!deletedPlan) return null;
    return SubscriptionPlansDTOMapper.toPresentation(deletedPlan);
  };
}
