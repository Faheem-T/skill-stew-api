import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan";
import { SubscriptionPlansSchemaType } from "../db/schemas/subscriptionPlansSchema";

export class PlansMapper {
  static toDomain(obj: SubscriptionPlansSchemaType): SubscriptionPlan {
    const {
      id,
      name,
      monthly_price,
      yearly_price,
      currency,
      free_workshop_hours,
      description,
      features,
      active,
    } = obj;
    return new SubscriptionPlan({
      name,
      description,
      price: { monthly: monthly_price, yearly: yearly_price, currency },
      freeWorkshopHours: free_workshop_hours,
      id,
      features,
      active,
    });
  }

  static toPersistence(
    obj: SubscriptionPlan,
  ): Omit<SubscriptionPlansSchemaType, "id"> | SubscriptionPlansSchemaType {
    const {
      id,
      name,
      price,
      freeWorkshopHours,
      description,
      features,
      active,
    } = obj;
    const { monthly, yearly, currency } = price;
    return {
      ...(id ? { id } : {}),
      name,
      description,
      monthly_price: monthly,
      yearly_price: yearly,
      currency,
      free_workshop_hours: freeWorkshopHours,
      features,
      active,
    };
  }
}
