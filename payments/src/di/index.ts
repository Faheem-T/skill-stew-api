import { SubscriptionPlansUsecases } from "../application/SubscriptionPlansUsecases";
import { ENV } from "../config/dotenv";
import { SubscriptionPlansRepository } from "../infrastructure/db/SubscriptionPlansRepository";
import { SubscriptionPlansController } from "../presentation/controllers/SubscriptionPlansController";
import { AuthMiddleware } from "@skillstew/common";

const subscriptionPlansRepo = new SubscriptionPlansRepository();
const subscriptionPlansUsecases = new SubscriptionPlansUsecases(
  subscriptionPlansRepo,
);
export const subscriptionPlansController = new SubscriptionPlansController(
  subscriptionPlansUsecases,
);

export const authMiddleware = new AuthMiddleware(
  ENV.USER_ACCESS_TOKEN_SECRET,
  ENV.EXPERT_ACCESS_TOKEN_SECRET,
  ENV.ADMIN_ACCESS_TOKEN_SECRET,
);
