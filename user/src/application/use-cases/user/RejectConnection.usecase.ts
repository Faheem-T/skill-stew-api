import { CreateEvent } from "@skillstew/common";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IProducer } from "../../ports/IProducer";
import { IRejectConnection } from "../../interfaces/user/IRejectConnection";

export class RejectConnection implements IRejectConnection {
  constructor(
    private connectionRepo: IUserConnectionRepository,
    private messageProducer: IProducer,
  ) {}

  exec = async (connectionId: string, userId: string): Promise<void> => {
    const foundConnection = await this.connectionRepo.findById(connectionId);

    if (foundConnection.recipientId !== userId) {
      throw new UnauthorizedError();
    }

    await this.connectionRepo.update(connectionId, { status: "REJECTED" });

    const event = CreateEvent(
      "connection.rejected",
      {
        connectionId,
        fromUserId: foundConnection.requesterId,
        toUserId: foundConnection.recipientId,
        timestamp: new Date(),
      },
      "user-service",
    );

    this.messageProducer.publish(event);
  };
}
