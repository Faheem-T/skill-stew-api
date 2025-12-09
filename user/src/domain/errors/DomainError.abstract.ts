import { DomainErrorCodes } from "./DomainErrorCodes";

export abstract class DomainError extends Error {
  constructor(
    public readonly statusCode: DomainErrorCodes,
    message?: string,
  ) {
    super(message);
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}
