import { eq } from "drizzle-orm";
import { AdminProfile } from "../../domain/entities/AdminProfile";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { IAdminProfileRepository } from "../../domain/repositories/IAdminProfileRepository";
import { db } from "../../start";
import { adminProfileTable } from "../db/schemas/adminProfileSchema";
import { AdminProfileMapper } from "../mappers/AdminProfileMapper";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { BaseRepository } from "./BaseRepository";

export class AdminProfileRepository
  extends BaseRepository<AdminProfile, typeof adminProfileTable>
  implements IAdminProfileRepository
{
  constructor() {
    super(adminProfileTable);
  }

  mapper = new AdminProfileMapper();

  findByUserId = async (userId: string): Promise<AdminProfile> => {
    let row;
    try {
      const res = await db
        .select()
        .from(this.table)
        .where(eq(this.table.user_id, userId));
      row = res[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }
    if (!row) {
      throw new NotFoundError("admin profile");
    }

    return this.mapper.toDomain(row);
  };

  updateByUserId = async (
    userId: string,
    partial: Partial<AdminProfile>,
  ): Promise<AdminProfile> => {
    const data = this.mapper.toPersistencePartial(partial);

    let row;
    try {
      const res = await db
        .update(this.table)
        .set(data)
        .where(eq(this.table.user_id, userId))
        .returning();
      row = res[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }
    if (!row) {
      throw new NotFoundError("admin profile");
    }

    return this.mapper.toDomain(row);
  };
}
