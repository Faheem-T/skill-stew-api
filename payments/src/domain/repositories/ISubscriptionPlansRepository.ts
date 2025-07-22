import { SubscriptionPlansSchemaType } from "../../infrastructure/db/schemas/subscriptionPlansSchema";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";

export interface ISubscriptionPlansRepository {
  save(plan: SubscriptionPlan): Promise<void>;
  getAllPlans(): Promise<SubscriptionPlan[]>;
  update(
    id: string,
    data: Partial<SubscriptionPlansSchemaType>,
  ): Promise<SubscriptionPlan>;
}
