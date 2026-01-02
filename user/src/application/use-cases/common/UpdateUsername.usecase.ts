import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UpdateUsernameDTO } from "../../dtos/common/UpdateUsername.dto";
import { ICheckUsernameAvailability } from "../../interfaces/common/ICheckUsernameAvailability";
import { IUpdateUsername } from "../../interfaces/common/IUpdateUsername";
import { IBloomFilter } from "../../ports/IBloomFilter";
import { ILogger } from "../../ports/ILogger";

export class UpdateUsername implements IUpdateUsername {
  constructor(
    private _userRepo: IUserRepository,
    private _checkUsernameAvailability: ICheckUsernameAvailability,
    private _usernameBloomFilter: IBloomFilter,
    private _logger: ILogger,
  ) {}

  exec = async (dto: UpdateUsernameDTO): Promise<void> => {
    const { username, userId } = dto;

    const { available } = await this._checkUsernameAvailability.exec({
      username,
    });

    if (!available) {
      return;
    }

    const user = await this._userRepo.findById(userId);
    const updatedUser = await this._userRepo.update(user.id, { username });
    this._logger.warn(
      `User ${user.id} changed username. Old username: ${user.username ?? "No username"}. New username: ${updatedUser.username}`,
    );
    this._usernameBloomFilter.add(username);
  };
}
