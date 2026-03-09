import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { NotificationData } from "../../domain/entities/NotificationData";

export interface CreateNotificationDTO {
  recipientId: string;
  type: NotificationType;
  data: NotificationData;
}

export interface CreateNotificationOutputDTO {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: Date;
}
