import { eq } from "drizzle-orm";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../../domain/repositories/ISubscriptionPlansRepository";
import { db } from "../../start";
import { PlansMapper } from "../mappers/PlansMapper";
import {
  subscriptionPlansSchema,
  SubscriptionPlansSchemaType,
} from "./schemas/subscriptionPlansSchema";

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

  getAllPlans = async (): Promise<SubscriptionPlan[]> => {
    const rows = await db.select().from(subscriptionPlansSchema);
    return rows.map(PlansMapper.toDomain);
  };

  update = async (
    id: string,
    data: Partial<SubscriptionPlansSchemaType>,
  ): Promise<SubscriptionPlan> => {
    const [plan] = await db
      .update(subscriptionPlansSchema)
      .set(data)
      .where(eq(subscriptionPlansSchema.id, id))
      .returning();
    return PlansMapper.toDomain(plan);
  };
}
