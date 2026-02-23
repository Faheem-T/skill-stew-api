import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { NotificationData } from "../../domain/entities/NotificationData";

export interface CreateNotificationDTO {
  recipientId: string;
  type: NotificationType;
  data: NotificationData;
}
