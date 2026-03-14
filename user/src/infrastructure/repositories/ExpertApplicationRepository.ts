import { and, desc, eq, lt, SQL } from "drizzle-orm";
import { ExpertApplication } from "../../domain/entities/ExpertApplication";
import {
  FindAllExpertApplicationsInput,
  FindAllExpertApplicationsOutput,
  IExpertApplicationRepository,
} from "../../domain/repositories/IExpertApplicationRepository";
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

  findAll = async (
    input: FindAllExpertApplicationsInput,
    tx?: TransactionContext,
  ): Promise<FindAllExpertApplicationsOutput> => {
    try {
      const runner = tx ?? db;
      const conditions: SQL[] = [];

      if (input.cursor) {
        conditions.push(lt(this.table.id, input.cursor));
      }

      if (input.filters?.status) {
        conditions.push(eq(this.table.status, input.filters.status));
      }

      const rows = await runner
        .select()
        .from(this.table)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(this.table.id))
        .limit(input.limit + 1);

      const hasNextPage = rows.length > input.limit;
      const pageRows = hasNextPage ? rows.slice(0, input.limit) : rows;
      const applications = pageRows.map((row) => this.mapper.toDomain(row));

      return {
        applications,
        hasNextPage,
        nextCursor: hasNextPage ? pageRows[pageRows.length - 1]?.id : undefined,
      };
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
