import { UserConnection } from "../../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { ISendConnectionRequest } from "../../interfaces/user/ISendConnectionRequest";
import { v7 as uuidv7 } from "uuid";
import { IProducer } from "../../ports/IProducer";
import { CreateEvent } from "@skillstew/common";
import { AppError } from "../../errors/AppError.abstract";
import { DbForeignKeyConstraintError } from "../../errors/infra/DbForeignKeyConstraintError";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { DbUniqueConstraintError } from "../../errors/infra/DbUniqueConstraintError";
import { AlreadyExistsError } from "../../../domain/errors/AlreadyExistsError";
import { SelfConnectionError } from "../../../domain/errors/SelfConnectionError";

export class SendConnectionRequest implements ISendConnectionRequest {
  constructor(
    private connectionRepo: IUserConnectionRepository,
    private messageProducer: IProducer,
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
      // No need for separate "does user exist" check
      // as create will fail with foreign key contraint error
      // if userId not valid

      const savedConnection = await this.connectionRepo.create(newConnection);
      const event = CreateEvent(
        "connection.requested",
        {
          connectionId: savedConnection.id,
          fromUserId: savedConnection.requesterId,
          toUserId: savedConnection.recipientId,
          timestamp: savedConnection.createdAt,
        },
        "user-service",
      );
      this.messageProducer.publish(event);
    } catch (err) {
      if (err instanceof AppError) {
        if (err instanceof DbForeignKeyConstraintError) {
          throw new NotFoundError("User");
        } else if (err instanceof DbUniqueConstraintError) {
          throw new AlreadyExistsError("Connection");
        }
      }
      throw err;
    }
  };
}
