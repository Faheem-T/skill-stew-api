import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IBloomFilter } from "../../ports/IBloomFilter";
import { ILogger } from "../../ports/ILogger";

export class InitializeUsernameBloomfilter {
  constructor(
    private _userRepo: IUserRepository,
    private _usernameBloomfilter: IBloomFilter,
    private _logger: ILogger,
  ) {}
  exec = async () => {
    const usernames = await this._userRepo.getAllUsernames();
    this._logger.info("Initializing username bloom filter", { usernames });
    usernames.forEach((username) => {
      this._usernameBloomfilter.add(username);
    });
  };
}
