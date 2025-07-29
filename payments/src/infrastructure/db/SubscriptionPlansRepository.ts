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
  save = async (plan: SubscriptionPlan): Promise<SubscriptionPlan | null> => {
    const pPlan = PlansMapper.toPersistence(plan);
    if (plan.id) {
      const [updatedPlan] = await db
        .update(subscriptionPlansSchema)
        .set(pPlan)
        .where(eq(subscriptionPlansSchema.id, plan.id))
        .returning();
      if (!updatedPlan) {
        return null;
      }
      return PlansMapper.toDomain(updatedPlan);
    } else {
      const [newPlan] = await db
        .insert(subscriptionPlansSchema)
        .values(pPlan)
        .returning();
      return PlansMapper.toDomain(newPlan);
    }
  };

  getAllPlans = async (): Promise<SubscriptionPlan[]> => {
    const rows = await db.select().from(subscriptionPlansSchema);
    return rows.map(PlansMapper.toDomain);
  };

  update = async (
    id: string,
    data: Partial<SubscriptionPlansSchemaType>,
  ): Promise<SubscriptionPlan | null> => {
    const [plan] = await db
      .update(subscriptionPlansSchema)
      .set(data)
      .where(eq(subscriptionPlansSchema.id, id))
      .returning();
    if (!plan) {
      return null;
    }
    return PlansMapper.toDomain(plan);
  };

  delete = async (id: string): Promise<SubscriptionPlan | null> => {
    const [plan] = await db
      .delete(subscriptionPlansSchema)
      .where(eq(subscriptionPlansSchema.id, id))
      .returning();
    if (!plan) {
      return null;
    }
    return PlansMapper.toDomain(plan);
  };
}
