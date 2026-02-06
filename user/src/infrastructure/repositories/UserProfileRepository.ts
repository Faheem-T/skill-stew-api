import { eq } from "drizzle-orm";
import { UserProfile } from "../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { db } from "../../start";
import { userProfileTable } from "../db/schemas/userProfileSchema";
import { UserProfileMapper } from "../mappers/UserProfileMapper";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { mapDrizzleError } from "../mappers/ErrorMapper";

export class UserProfileRepository
  extends BaseRepository<UserProfile, typeof userProfileTable>
  implements IUserProfileRepository
{
  constructor() {
    super(userProfileTable);
  }

  mapper = new UserProfileMapper();
  findByUserId = async (userId: string): Promise<UserProfile> => {
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
      throw new NotFoundError("user profile");
    }

    return this.mapper.toDomain(row);
  };

  updateByUserId = async (
    userId: string,
    partial: Partial<UserProfile>,
  ): Promise<UserProfile> => {
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
      throw new NotFoundError("profile");
    }

    return this.mapper.toDomain(row);
  };
}
