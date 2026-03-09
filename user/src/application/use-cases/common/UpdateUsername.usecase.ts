import { EventName, EventPayload } from "@skillstew/common";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UpdateUsernameDTO } from "../../dtos/common/UpdateUsername.dto";
import { ICheckUsernameAvailability } from "../../interfaces/common/ICheckUsernameAvailability";
import { IUpdateUsername } from "../../interfaces/common/IUpdateUsername";
import { IBloomFilter } from "../../ports/IBloomFilter";
import { ILogger } from "../../ports/ILogger";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { v7 as uuidv7 } from "uuid";

export class UpdateUsername implements IUpdateUsername {
  constructor(
    private _userRepo: IUserRepository,
    private _checkUsernameAvailability: ICheckUsernameAvailability,
    private _usernameBloomFilter: IBloomFilter,
    private _logger: ILogger,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (dto: UpdateUsernameDTO): Promise<void> => {
    const { username: rawUsername, userId } = dto;

    const username = rawUsername.toLowerCase();

    const { available } = await this._checkUsernameAvailability.exec({
      username,
    });

    if (!available) {
      return;
    }

    const user = await this._userRepo.findById(userId);

    await this._unitOfWork.transact(async (tx) => {
      const updatedUser = await this._userRepo.update(
        user.id,
        { username },
        tx,
      );

      const eventName: EventName = "user.profileUpdated";
      const payload: EventPayload<typeof eventName> = {
        id: updatedUser.id,
        username: updatedUser.username,
      };

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: eventName,
          payload,
          status: "PENDING",
          createdAt: new Date(),
          processedAt: undefined,
        },
        tx,
      );
    });

    this._logger.warn(
      `User ${user.id} changed username. Old username: ${user.username ?? "No username"}. New username: ${username}`,
    );
    this._usernameBloomFilter.add(username);
  };
}
