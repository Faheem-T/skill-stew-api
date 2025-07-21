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
    } = obj;
    return new SubscriptionPlan({
      name,
      price: { monthly: monthly_price, yearly: yearly_price, currency },
      freeWorkshopHours: free_workshop_hours,
      id,
    });
  }

  static toPersistence(
    obj: SubscriptionPlan,
  ): Omit<SubscriptionPlansSchemaType, "id"> | SubscriptionPlansSchemaType {
    const { id, name, price, freeWorkshopHours } = obj;
    const { monthly, yearly, currency } = price;
    return {
      name,
      ...(id ? { id } : {}),
      monthly_price: monthly,
      yearly_price: yearly,
      currency,
      free_workshop_hours: freeWorkshopHours,
    };
  }
}
