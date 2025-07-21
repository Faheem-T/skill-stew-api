import { eq } from "drizzle-orm";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../../domain/repositories/ISubscriptionPlansRepository";
import { db } from "../../start";
import { PlansMapper } from "../mappers/PlansMapper";
import { subscriptionPlansSchema } from "./schemas/subscriptionPlansSchema";

export class SubscriptionPlansRepository
  implements ISubscriptionPlansRepository
{
  save = async (plan: SubscriptionPlan): Promise<void> => {
    const pPlan = PlansMapper.toPersistence(plan);
    if (plan.id) {
      await db
        .update(subscriptionPlansSchema)
        .set(pPlan)
        .where(eq(subscriptionPlansSchema.id, plan.id));
    } else {
      await db.insert(subscriptionPlansSchema).values(pPlan);
    }
  };
}
