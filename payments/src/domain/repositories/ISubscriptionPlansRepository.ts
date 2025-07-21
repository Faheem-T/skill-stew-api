import { SubscriptionPlan } from "../entities/SubscriptionPlan";

export interface ISubscriptionPlansRepository {
  save(plan: SubscriptionPlan): Promise<void>;
}
