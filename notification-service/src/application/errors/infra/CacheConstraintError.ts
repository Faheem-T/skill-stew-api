import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class CacheConstraintError extends InfraError {
  constructor(message: string) {
    super(AppErrorCodes.CACHE_CONSTRAINT_ERROR, message);
  }

  override toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: "Something went wrong." }] };
  }
}
