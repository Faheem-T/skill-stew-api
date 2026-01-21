import { SubscriptionPlan } from "../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../domain/repositories/ISubscriptionPlansRepository";
import {
  CreateSubscriptionPlanDto,
  EditSubscriptionPlanDto,
} from "./dtos/SubscriptionPlansDtos";
import { ISubscriptionPlansUsecases } from "./interfaces/ISubscriptionPlansUsecases";
import { SubscriptionPlansDTOMapper } from "./mapper/SubscriptionPlansDTOMapper";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { PlanAlreadyExistsError } from "../domain/errors/PlanAlreadyExistsError";

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

    try {
      const savedPlan = await this._plansRepo.save(plan);
      if (!savedPlan) throw new PlanAlreadyExistsError(name);
      return SubscriptionPlansDTOMapper.toPresentation(savedPlan);
    } catch (err) {
      // If it's our domain error, rethrow it
      if (err instanceof PlanAlreadyExistsError) {
        throw err;
      }
      // Otherwise rethrow as NotFoundError (repository returns null)
      throw new NotFoundError("Subscription Plan");
    }
  };

  getPlans = async () => {
    const plans = await this._plansRepo.getAllPlans();
    return plans.map(SubscriptionPlansDTOMapper.toPresentation);
  };

  editPlan = async (id: string, dto: EditSubscriptionPlanDto) => {
    const editedPlan = await this._plansRepo.update(id, dto);
    if (!editedPlan) throw new NotFoundError("Subscription Plan");
    return SubscriptionPlansDTOMapper.toPresentation(editedPlan);
  };

  deletePlan = async (id: string) => {
    const deletedPlan = await this._plansRepo.delete(id);
    if (!deletedPlan) throw new NotFoundError("Subscription Plan");
    return SubscriptionPlansDTOMapper.toPresentation(deletedPlan);
  };
}
