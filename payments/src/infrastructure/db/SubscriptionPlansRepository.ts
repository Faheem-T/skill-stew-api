import { eq } from "drizzle-orm";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan";
import { ISubscriptionPlansRepository } from "../../domain/repositories/ISubscriptionPlansRepository";
import { db } from "../../start";
import { PlansMapper } from "../mappers/PlansMapper";
import {
  subscriptionPlansSchema,
  SubscriptionPlansSchemaType,
} from "./schemas/subscriptionPlansSchema";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { PlanAlreadyExistsError } from "../../domain/errors/PlanAlreadyExistsError";
import { mapDrizzleError } from "../mappers/ErrorMapper";

export class SubscriptionPlansRepository
  implements ISubscriptionPlansRepository
{
  save = async (plan: SubscriptionPlan): Promise<SubscriptionPlan | null> => {
    try {
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
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  getAllPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
      const rows = await db.select().from(subscriptionPlansSchema);
      return rows.map(PlansMapper.toDomain);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  update = async (
    id: string,
    data: Partial<SubscriptionPlansSchemaType>,
  ): Promise<SubscriptionPlan | null> => {
    try {
      const [plan] = await db
        .update(subscriptionPlansSchema)
        .set(data)
        .where(eq(subscriptionPlansSchema.id, id))
        .returning();
      if (!plan) {
        return null;
      }
      return PlansMapper.toDomain(plan);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  delete = async (id: string): Promise<SubscriptionPlan | null> => {
    try {
      const [plan] = await db
        .delete(subscriptionPlansSchema)
        .where(eq(subscriptionPlansSchema.id, id))
        .returning();
      if (!plan) {
        return null;
      }
      return PlansMapper.toDomain(plan);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
