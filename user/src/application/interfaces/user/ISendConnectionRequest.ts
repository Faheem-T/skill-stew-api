import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";

export interface ISendConnectionRequest {
  exec(requesterId: string, recipientId: string): Promise<UserConnectionStatus>;
}
