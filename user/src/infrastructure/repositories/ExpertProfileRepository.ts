import { eq } from "drizzle-orm";
import { ExpertProfile } from "../../domain/entities/ExpertProfile";
import { IExpertProfileRepository } from "../../domain/repositories/IExpertProfileRepository";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";
import { expertProfileTable } from "../db/schemas/expertProfileSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { ExpertProfileMapper } from "../mappers/ExpertProfileMapper";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";

export class ExpertProfileRepository
  extends BaseRepository<ExpertProfile, typeof expertProfileTable>
  implements IExpertProfileRepository
{
  constructor() {
    super(expertProfileTable);
  }

  protected mapper = new ExpertProfileMapper();

  findByExpertId = async (
    expertId: string,
    tx?: TransactionContext,
  ): Promise<ExpertProfile> => {
    let row;
    try {
      const runner = tx ?? db;
      const res = await runner
        .select()
        .from(this.table)
        .where(eq(this.table.expert_id, expertId));
      row = res[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }
    if (!row) {
      throw new NotFoundError("expert profile");
    }

    return this.mapper.toDomain(row);
  };
}
