import { UserConnectionStatus } from "../entities/UserConnectionStatus";
import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class ConflictingConnectionRequest extends DomainError {
  constructor(
    private _existingConnectionStatus: UserConnectionStatus,
    existingRequesterId: string,
    existingRequesterUsername: string | undefined,
    existingRecipientId: string,
    existingRecipientUsername: string | undefined,
  ) {
    super(
      DomainErrorCodes.CONFLICTING_CONNECTION_REQUEST_ERROR,
      `Connection with status ${_existingConnectionStatus} already exists from user ${existingRequesterId} (${existingRequesterUsername}) to ${existingRecipientId} (${existingRecipientUsername})`,
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return {
      errors: [
        {
          message: `You already have a connection of status ${this._existingConnectionStatus} from this user`,
        },
      ],
    };
  }
}
