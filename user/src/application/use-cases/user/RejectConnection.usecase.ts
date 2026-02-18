import { EventName, EventPayload } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IRejectConnection } from "../../interfaces/user/IRejectConnection";
import { RejectingAcceptedConnectionError } from "../../../domain/errors/RejectingAcceptedError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";

export class RejectConnection implements IRejectConnection {
  constructor(
    private _connectionRepo: IUserConnectionRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (connectionId: string, userId: string): Promise<void> => {
    const foundConnection = await this._connectionRepo.findById(connectionId);

    if (foundConnection.recipientId !== userId) {
      throw new UnauthorizedError();
    }

    if (foundConnection.status === "ACCEPTED") {
      throw new RejectingAcceptedConnectionError();
    }

    if (foundConnection.status === "REJECTED") {
      return;
    }

    await this._unitOfWork.transact(async (tx) => {
      const savedConnection = await this._connectionRepo.update(
        connectionId,
        { status: "REJECTED" },
        tx,
      );

      const eventName: EventName = "connection.rejected";

      const payload: EventPayload<typeof eventName> = {
        connectionId: savedConnection.id,
        fromUserId: savedConnection.requesterId,
        toUserId: savedConnection.recipientId,
        timestamp: savedConnection.createdAt,
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
