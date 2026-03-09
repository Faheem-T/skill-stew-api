import type {
  CreateNotificationDTO,
  CreateNotificationOutputDTO,
} from "../dtos/CreateNotification.dto";
import type { GetNotificationsForUserDTO } from "../dtos/GetNotificationsForUser.dto";
import { Notification } from "../../domain/entities/Notification";

export interface INotificationService {
  createNotification(
    dto: CreateNotificationDTO,
  ): Promise<CreateNotificationOutputDTO>;
  getNotificationsForUser(dto: GetNotificationsForUserDTO): Promise<{
    notifications: Notification[];
    hasNextPage: boolean;
    nextCursor?: string;
  }>;
  markRead(id: string, recipientId: string): Promise<Notification>;
}
