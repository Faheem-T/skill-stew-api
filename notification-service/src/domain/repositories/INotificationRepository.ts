import type { Notification } from "../entities/Notification";

export interface INotificationRepository {
  create(
    entity: Exclude<Notification, Notification["id"]>,
  ): Promise<Notification>;
  markRead(id: string, recipientId: string): Promise<Notification>;
}
