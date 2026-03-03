import { EventName, EventPayload } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IRejectConnection } from "../../interfaces/user/IRejectConnection";
import { RejectingAcceptedConnectionError } from "../../../domain/errors/RejectingAcceptedError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class RejectConnection implements IRejectConnection {
  constructor(
    private _connectionRepo: IUserConnectionRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _userRepo: IUserRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (connectionId: string, userId: string): Promise<void> => {
    const foundConnection = await this._connectionRepo.findById(connectionId);

    const recipientId =
      foundConnection.userId1 == foundConnection.requesterId
        ? foundConnection.userId2
        : foundConnection.userId1;

    if (recipientId !== userId) {
      throw new UnauthorizedError();
    }

    if (foundConnection.status === "ACCEPTED") {
      throw new RejectingAcceptedConnectionError();
    }

    await this._unitOfWork.transact(async (tx) => {
      await this._connectionRepo.delete(foundConnection.id, tx);

      const recipient = await this._userRepo.findById(recipientId, tx);

      const requester = await this._userRepo.findById(
        foundConnection.requesterId,
        tx,
      );

      const eventName: EventName = "connection.rejected";

      const payload: EventPayload<typeof eventName> = {
        connectionId: foundConnection.id,
        rejecterId: recipient.id,
        rejecterUsername: recipient.username,
        requesterId: requester.id,
        requesterUsername: requester.username,
        timestamp: new Date(),
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
  };
}
