import type { Notification } from "../entities/Notification";

export interface INotificationRepository {
  create(entity: Omit<Notification, "id" | "createdAt">): Promise<Notification>;
  markRead(id: string, recipientId: string): Promise<Notification>;
}
