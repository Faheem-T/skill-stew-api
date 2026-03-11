import { and, eq } from "drizzle-orm";
import { ExpertApplication } from "../../domain/entities/ExpertApplication";
import { IExpertApplicationRepository } from "../../domain/repositories/IExpertApplicationRepository";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";
import { expertApplicationTable } from "../db/schemas/expertApplicationSchema";
import { ExpertApplicationMapper } from "../mappers/ExpertApplicationMapper";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { BaseRepository } from "./BaseRepository";

export class ExpertApplicationRepository
  extends BaseRepository<ExpertApplication, typeof expertApplicationTable>
  implements IExpertApplicationRepository
{
  constructor() {
    super(expertApplicationTable);
  }
  mapper = new ExpertApplicationMapper();

  findPendingByEmail = async (
    email: string,
    tx?: TransactionContext,
  ): Promise<ExpertApplication | null> => {
    try {
      const runner = tx ?? db;
      const rows = await runner
        .select()
        .from(this.table)
        .where(
          and(eq(this.table.email, email), eq(this.table.status, "pending")),
        )
        .limit(1);

      return rows[0] ? this.mapper.toDomain(rows[0]) : null;
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
