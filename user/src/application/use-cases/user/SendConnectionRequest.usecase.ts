import { UserConnection } from "../../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { ISendConnectionRequest } from "../../interfaces/user/ISendConnectionRequest";
import { v7 as uuidv7 } from "uuid";
import { EventName, EventPayload } from "@skillstew/common";
import { AppError } from "../../errors/AppError.abstract";
import { DbForeignKeyConstraintError } from "../../errors/infra/DbForeignKeyConstraintError";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { SelfConnectionError } from "../../../domain/errors/SelfConnectionError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class SendConnectionRequest implements ISendConnectionRequest {
  constructor(
    private _connectionRepo: IUserConnectionRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _userRepo: IUserRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (requesterId: string, recipientId: string): Promise<void> => {
    if (requesterId == recipientId) {
      throw new SelfConnectionError();
    }

    const newConnection = new UserConnection(
      uuidv7(),
      requesterId,
      recipientId,
      requesterId,
      "PENDING",
      new Date(),
      new Date(),
    );

    try {
      await this._unitOfWork.transact(async (tx) => {
        const savedConnection = await this._connectionRepo.upsert(
          newConnection,
          tx,
        );

        if (savedConnection.status === "ACCEPTED") {
          const savedRecipientId =
            savedConnection.requesterId == savedConnection.userId1
              ? savedConnection.userId2
              : savedConnection.userId1;

          const requester = await this._userRepo.findById(
            savedConnection.requesterId,
            tx,
          );
          const recipient = await this._userRepo.findById(savedRecipientId, tx);

          const eventName: EventName = "connection.accepted";

          const payload: EventPayload<typeof eventName> = {
            connectionId: savedConnection.id,
            requesterId: savedConnection.requesterId,
            requesterUsername: requester.username,
            accepterId: recipient.id,
            accepterUsername: recipient.username,
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
        } else {
          const requester = await this._userRepo.findById(requesterId, tx);
          const recipient = await this._userRepo.findById(recipientId, tx);

          const eventName: EventName = "connection.requested";

          const payload: EventPayload<typeof eventName> = {
            connectionId: savedConnection.id,
            requesterId: savedConnection.requesterId,
            requesterUsername: requester.username,
            recipientId: recipient.id,
            recipientUsername: recipient.username,
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
        }
      });
    } catch (err) {
      if (err instanceof AppError) {
        if (
          err instanceof DbForeignKeyConstraintError ||
          err instanceof NotFoundError
        ) {
          throw new NotFoundError("User");
        }
      }
      throw err;
    }
  };
}
