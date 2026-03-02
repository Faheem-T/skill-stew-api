import type { TransactionContext } from "../../types/TransactionContext";
import type { Notification } from "../entities/Notification";

export interface INotificationRepository {
  create(
    entity: Omit<Notification, "id" | "createdAt">,
    tx?: TransactionContext,
  ): Promise<Notification>;

  markRead(
    id: string,
    recipientId: string,
    tx?: TransactionContext,
  ): Promise<Notification>;

  getNotificationsForUser(
    userId: string,
    lastReadId: string | undefined,
    limit: number,
  ): Promise<{
    notifications: Notification[];
    hasNextPage: boolean;
    nextCursor?: string;
  }>;

  findById(id: string): Promise<Notification>;
}
