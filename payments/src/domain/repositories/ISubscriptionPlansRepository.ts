import { SubscriptionPlansSchemaType } from "../../infrastructure/db/schemas/subscriptionPlansSchema";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";

export interface ISubscriptionPlansRepository {
  save(plan: SubscriptionPlan): Promise<SubscriptionPlan | null>;
  getAllPlans(): Promise<SubscriptionPlan[]>;
  update(
    id: string,
    data: Partial<SubscriptionPlansSchemaType>,
  ): Promise<SubscriptionPlan | null>;
  delete(id: string): Promise<SubscriptionPlan | null>;
}
