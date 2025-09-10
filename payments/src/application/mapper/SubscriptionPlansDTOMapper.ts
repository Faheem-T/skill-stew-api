import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan";
import { PresentationSubscriptionPlan } from "../interfaces/ISubscriptionPlansUsecases";

export class SubscriptionPlansDTOMapper {
  static toPresentation(plan: SubscriptionPlan): PresentationSubscriptionPlan {
    const {
      name,
      description,
      features,
      freeWorkshopHours,
      active,
      price,
      id,
    } = plan;
    return {
      id: id!,
      name,
      description,
      features,
      active,
      price,
      free_workshop_hours: freeWorkshopHours,
    };
  }
}
