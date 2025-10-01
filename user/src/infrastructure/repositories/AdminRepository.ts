import { eq } from "drizzle-orm";
import { Admin } from "../../domain/entities/Admin";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { db } from "../../start";
import { AdminMapper } from "../mappers/AdminMapper";
import { adminSchema } from "../db/schemas/adminSchema";
import { DatabaseError } from "../errors/DatabaseError";

export class AdminRepository implements IAdminRepository {
  create = async (admin: Admin): Promise<void> => {
    const pAdmin = AdminMapper.toPersistence(admin);
    await db.insert(adminSchema).values(pAdmin);
  };

  getAdminByUsername = async (username: string): Promise<Admin | null> => {
    try {
      const [foundAdmin] = await db
        .select()
        .from(adminSchema)
        .where(eq(adminSchema.username, username));
      if (!foundAdmin) {
        return null;
      }
      return AdminMapper.toDomain(foundAdmin);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };
  getAdminById = async (id: string): Promise<Admin | null> => {
    try {
      const [foundAdmin] = await db
        .select()
        .from(adminSchema)
        .where(eq(adminSchema.id, id));
      if (!foundAdmin) {
        return null;
      }
      return AdminMapper.toDomain(foundAdmin);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };
}
