import { injectable, inject } from "inversify";
import type { INotificationService } from "../service-interfaces/INotificationService";
import type { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { TYPES } from "../../constants/Types";
import type { Notification } from "../../domain/entities/Notification";
import type {
  CreateNotificationDTO,
  CreateNotificationOutputDTO,
} from "../dtos/CreateNotification.dto";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { NotificationData } from "../../domain/entities/NotificationData";
import type { GetNotificationsForUserDTO } from "../dtos/GetNotificationsForUser.dto";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepo: INotificationRepository,
  ) {}

  createNotification = async (
    dto: CreateNotificationDTO,
  ): Promise<CreateNotificationOutputDTO> => {
    const { recipientId, type, data } = dto;

    const { message, title } = this._getNotificationContent(data);

    const notification: Omit<Notification, "id" | "createdAt"> = {
      recipientId,
      type,
      data,
      title,
      message,
      isRead: false,
    };

    return await this._notificationRepo.create(notification);
  };

  getNotificationsForUser = async (
    dto: GetNotificationsForUserDTO,
  ): Promise<{
    notifications: Notification[];
    hasNextPage: boolean;
    nextCursor?: string;
  }> => {
    const { userId, lastReadId, limit } = dto;
    return await this._notificationRepo.getNotificationsForUser(
      userId,
      lastReadId,
      limit,
    );
  };

  markRead = async (id: string, recipientId: string): Promise<Notification> => {
    return await this._notificationRepo.markRead(id, recipientId);
  };

  private _getNotificationContent(data: NotificationData): {
    title: string;
    message: string;
  } {
    switch (data.type) {
      case NotificationType.CONNECTION_REQUEST:
        return {
          title: "New Connection Request",
          message: `${data.senderUsername ?? "User" + data.senderId} wants to connect with you`,
        };
      case NotificationType.CONNECTION_ACCEPTED:
        return {
          title: "Connection Accepted",
          message: `${data.accepterUsername ?? "User" + data.accepterId} accepted your connection request`,
        };
      case NotificationType.CONNECTION_REJECTED:
        return {
          title: "Connection Declined",
          message: `${data.rejecterUsername ?? "User" + data.rejecterId} declined your connection request`,
        };
    }
  }
}
