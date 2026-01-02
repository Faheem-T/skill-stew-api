import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CheckUsernameAvailabilityDTO } from "../../dtos/common/CheckUsernameAvailability.dto";
import { ICheckUsernameAvailability } from "../../interfaces/common/ICheckUsernameAvailability";
import { IBloomFilter } from "../../ports/IBloomFilter";
import { ILogger } from "../../ports/ILogger";

export class CheckUsernameAvailability implements ICheckUsernameAvailability {
  constructor(
    private _userRepo: IUserRepository,
    private _usernameBloomFilter: IBloomFilter,
    private _logger: ILogger,
  ) {}

  exec = async (
    dto: CheckUsernameAvailabilityDTO,
  ): Promise<{ available: boolean }> => {
    if (!this._usernameBloomFilter.has(dto.username)) {
      this._logger.info("Username not in bloom filter. Skipping DB call.");
      return { available: true };
    }

    this._logger.info("Username found in bloom filter. Performing DB call.");
    // Query db only if bloom filter returns true
    try {
      this._userRepo.findByUsername(dto.username);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return { available: true };
      } else {
        throw err;
      }
    }

    return { available: false };
  };
}
