import { AppError } from "./AppError.abstract";
import { ConflictError } from "./ConflictError";
import { UnexpectedError } from "./UnexpectedError";

export function mapDrizzleErrorToAppError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case "23505": // Unique identifier violation
        return new ConflictError();
      default:
        return new UnexpectedError();
    }
  }

  return new UnexpectedError();
}
