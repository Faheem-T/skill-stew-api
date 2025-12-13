import { AppError } from "./AppError.abstract";
import { AppErrorCodes } from "./AppErrorCodes";

export class ConflictError extends AppError {
  constructor(message: string = "Conflict occurred") {
    super(AppErrorCodes.CONFLICT, message);
  }

  toJSON() {
    return {
      errors: [
        {
          message: this.message,
        },
      ],
    };
  }
}
