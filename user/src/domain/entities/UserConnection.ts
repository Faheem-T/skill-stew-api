import { UserConnectionStatus } from "./UserConnectionStatus";

export class UserConnection {
  constructor(
    public id: string,
    public requesterId: string,
    public recipientId: string,
    public status: UserConnectionStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
