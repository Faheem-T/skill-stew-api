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
import type { IUnitOfWork } from "../ports/IUnitOfWork";
import type { ClientSession } from "mongoose";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";
import type { IUnreadNotificationCountCache } from "../ports/IUnreadNotificationCountCache";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepo: INotificationRepository,
    @inject(TYPES.UnreadNotificationCountRepository)
    private _unreadNotificationCountRepository: IUnreadNotificationCountRepository,
    @inject(TYPES.UnreadNotificationCountCache)
    private _unreadNotificationCountCache: IUnreadNotificationCountCache,
    @inject(TYPES.UnitOfWork)
    private _unitOfWork: IUnitOfWork,
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
    const result = await this._unitOfWork.transact(
      async (tx: ClientSession) => {
        const savedNotification = await this._notificationRepo.create(
          notification,
          tx,
        );

        await this._unreadNotificationCountRepository.incrementByUserId(
          savedNotification.recipientId,
          1,
          tx,
        );

        return savedNotification;
      },
    );

    await this._unreadNotificationCountCache.incrementByUserId(
      result.recipientId,
      1,
    );

    return result;
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
    const notification = await this._notificationRepo.findById(id);

    if (notification.isRead) {
      return notification;
    }

    const result = await this._unitOfWork.transact(
      async (tx: ClientSession) => {
        const notification = await this._notificationRepo.markRead(
          id,
          recipientId,
          tx,
        );

        await this._unreadNotificationCountRepository.decrementByUserId(
          notification.recipientId,
          1,
          tx,
        );

        return notification;
      },
    );

    await this._unreadNotificationCountCache.decrementByUserId(
      result.recipientId,
      1,
    );

    return result;
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
