import { SubscriptionPlansUsecases } from "../application/SubscriptionPlansUsecases";
import { SubscriptionPlansRepository } from "../infrastructure/db/SubscriptionPlansRepository";
import { SubscriptionPlansController } from "../presentation/controllers/SubscriptionPlansController";

const subscriptionPlansRepo = new SubscriptionPlansRepository();
const subscriptionPlansUsecases = new SubscriptionPlansUsecases(
  subscriptionPlansRepo,
);
export const subscriptionPlansController = new SubscriptionPlansController(
  subscriptionPlansUsecases,
);
