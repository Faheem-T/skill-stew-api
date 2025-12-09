import { AppErrorCodes } from "./AppErrorCodes";

export abstract class AppError extends Error {
  constructor(
    public readonly statusCode: AppErrorCodes,
    message?: string,
  ) {
    super(message);
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}
