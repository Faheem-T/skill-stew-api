import { InfrastructureError } from "../../core/errors/AppError";
import { DatabaseErrorCodes } from "./DatabaseErrorCodes";

export class DatabaseError extends InfrastructureError {
  constructor(err: unknown) {
    console.log("DATABASE_ERROR:", err);
    super(DatabaseErrorCodes["DATABASE_ERROR"], "DATABASE_ERROR");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
