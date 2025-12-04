import { eq } from "drizzle-orm";
import { UserProfile } from "../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { db } from "../../start";
import { userProfileTable } from "../db/schemas/userProfileSchema";
import { UserProfileMapper } from "../mappers/UserProfileMapper";
import { BaseRepository } from "./BaseRepository";

export class UserProfileRepository
  extends BaseRepository<UserProfile, typeof userProfileTable>
  implements IUserProfileRepository
{
  constructor() {
    super(userProfileTable);
  }

  mapper = new UserProfileMapper();
  findByUserId = async (userId: string): Promise<UserProfile | undefined> => {
    const [row] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.user_id, userId));

    return row ? this.mapper.toDomain(row) : undefined;
  };

  updateByUserId = async (
    userId: string,
    partial: Partial<UserProfile>,
  ): Promise<UserProfile | undefined> => {
    const data = this.mapper.toPersistencePartial(partial);

    const [row] = (await db
      .update(this.table)
      .set(data)
      .where(eq(this.table.user_id, userId))
      .returning()) as any;

    return this.mapper.toDomain(row);
  };
}
