import { UserConnectionStatus } from "./UserConnectionStatus";

/**
 * Represents a connection (or connection request) between two users.
 *
 * `userId1` and `userId2` are always stored in lexicographic order
 * (`userId1 < userId2`), regardless of which user initiated the request.
 * This ensures a unique, order-independent representation of the pair,
 * so that (A, B) and (B, A) always map to the same row.
 *
 * The `requesterId` field tracks which user originally sent the request.
 */
export class UserConnection {
  userId1: string;
  userId2: string;
  constructor(
    public id: string,
    userId1: string,
    userId2: string,
    public requesterId: string,
    public status: UserConnectionStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    if (userId1.localeCompare(userId2) < 0) {
      this.userId1 = userId1;
      this.userId2 = userId2;
    } else {
      this.userId1 = userId2;
      this.userId2 = userId1;
    }
  }
}
