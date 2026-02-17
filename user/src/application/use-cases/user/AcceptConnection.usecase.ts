import { CreateEvent } from "@skillstew/common";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IAcceptConnection } from "../../interfaces/user/IAcceptConnection";
import { IProducer } from "../../ports/IProducer";
import { AcceptingRejectedConnectionError } from "../../../domain/errors/AcceptingRejectedConnection";

export class AcceptConnection implements IAcceptConnection {
  constructor(
    private connectionRepo: IUserConnectionRepository,
    private messageProducer: IProducer,
  ) {}

  exec = async (connectionId: string, userId: string): Promise<void> => {
    const foundConnection = await this.connectionRepo.findById(connectionId);

    if (foundConnection.recipientId !== userId) {
      throw new UnauthorizedError();
    }

    if (foundConnection.status === "REJECTED") {
      throw new AcceptingRejectedConnectionError();
    }

    if (foundConnection.status === "ACCEPTED") {
      return;
    }

    await this.connectionRepo.update(connectionId, { status: "ACCEPTED" });

    const event = CreateEvent(
      "connection.accepted",
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
