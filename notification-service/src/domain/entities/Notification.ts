import type { NotificationData } from "./NotificationData";
import type { NotificationType } from "./NotificationType.enum";

export class Notification {
  constructor(
    public id: string,
    public recipientId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public data: NotificationData,
    public isRead: boolean,
    public createdAt: Date,
  ) {}
}
