import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class AccountAuthProviderConflictError extends DomainError {
  constructor(
    public readonly email: string,
    public readonly existingProvider: "local" | "google",
    public readonly attemptedProvider: "local" | "google",
  ) {
    super(
      DomainErrorCodes.AUTH_PROVIDER_CONFLICT,
      "Authentication provider conflict",
    );
  }

  toJSON() {
    return {
      errors: [
        {
          message: `This email is already registered using ${this.existingProvider} login`,
        },
      ],
    };
  }
}
