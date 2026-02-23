import { injectable, inject } from "inversify";
import type { INotificationService } from "../service-interfaces/INotificationService";
import type { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { TYPES } from "../../constants/Types";
import type { Notification } from "../../domain/entities/Notification";
import type { CreateNotificationDTO } from "../dtos/CreateNotification.dto";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepo: INotificationRepository,
  ) {}

  createNotification = async (dto: CreateNotificationDTO): Promise<void> => {
    const { recipientId, type, data } = dto;

    const notification: Omit<Notification, "id" | "createdAt"> = {
      recipientId,
      type,
      data,
      title: "",
      message: "",
      isRead: false,
    };

    await this._notificationRepo.create(notification);
  };
}
