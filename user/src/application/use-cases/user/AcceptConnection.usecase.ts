import { EventName, EventPayload } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IAcceptConnection } from "../../interfaces/user/IAcceptConnection";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class AcceptConnection implements IAcceptConnection {
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
      return;
    }

    await this._unitOfWork.transact(async (tx) => {
      const savedConnection = await this._connectionRepo.update(
        connectionId,
        { status: "ACCEPTED" },
        tx,
      );

      const recipient = await this._userRepo.findById(recipientId, tx);

      const requester = await this._userRepo.findById(
        savedConnection.requesterId,
        tx,
      );

      const eventName: EventName = "connection.accepted";

      const payload: EventPayload<typeof eventName> = {
        connectionId: savedConnection.id,
        accepterId: recipient.id,
        accepterUsername: recipient.username,
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
