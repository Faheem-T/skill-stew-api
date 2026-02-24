import { UserConnection } from "../../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { ISendConnectionRequest } from "../../interfaces/user/ISendConnectionRequest";
import { v7 as uuidv7 } from "uuid";
import { EventName, EventPayload } from "@skillstew/common";
import { AppError } from "../../errors/AppError.abstract";
import { DbForeignKeyConstraintError } from "../../errors/infra/DbForeignKeyConstraintError";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { DbUniqueConstraintError } from "../../errors/infra/DbUniqueConstraintError";
import { AlreadyExistsError } from "../../../domain/errors/AlreadyExistsError";
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
      "PENDING",
      new Date(),
      new Date(),
    );

    try {
      await this._unitOfWork.transact(async (tx) => {
        const requester = await this._userRepo.findById(requesterId, tx);
        const recipient = await this._userRepo.findById(recipientId, tx);

        const savedConnection = await this._connectionRepo.create(
          newConnection,
          tx,
        );

        const eventName: EventName = "connection.requested";

        const payload: EventPayload<typeof eventName> = {
          connectionId: savedConnection.id,
          requesterId: savedConnection.requesterId,
          requesterUsername: requester.username,
          recipientId: savedConnection.recipientId,
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
      });
    } catch (err) {
      if (err instanceof AppError) {
        if (
          err instanceof DbForeignKeyConstraintError ||
          err instanceof NotFoundError
        ) {
          throw new NotFoundError("User");
        } else if (err instanceof DbUniqueConstraintError) {
          throw new AlreadyExistsError("Connection");
        }
      }
      throw err;
    }
  };
}
