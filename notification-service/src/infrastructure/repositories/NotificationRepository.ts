import { Notification } from "../../domain/entities/Notification";
import { NotFoundError } from "../../domain/errors";
import type { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { mapMongooseError } from "../mappers/DBErrorMapper";
import { NotificationModel } from "../models/NotificationModel";
import type {
  NotificationAttr,
  NotificationDoc,
} from "../models/NotificationModel";

export class NotificationRepository implements INotificationRepository {
  model = NotificationModel;

  create = async (
    entity: Exclude<Notification, Notification["id"]>,
  ): Promise<Notification> => {
    try {
      const attr = this.toPersistence(entity);
      const notification = this.model.build(attr);
      const savedNotification = await notification.save();
      return this.toDomain(savedNotification);
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  markRead = async (id: string, recipientId: string): Promise<Notification> => {
    try {
      const foundNotification = await this.model.findOne({
        _id: id,
        recipientId,
      });
      if (!foundNotification) {
        throw new NotFoundError("Notification");
      }
      foundNotification.isRead = true;
      const savedNotification = await foundNotification.save();
      return this.toDomain(savedNotification);
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  private toPersistence = (entity: Notification): NotificationAttr => {
    const { recipientId, type, title, message, data, isRead } = entity;
    return { recipientId, type, title, message, data, isRead };
  };

  private toDomain = (doc: NotificationDoc): Notification => {
    const { _id, recipientId, type, title, message, data, isRead, createdAt } =
      doc;

    return new Notification(
      _id.toString(),
      recipientId,
      type,
      title,
      message,
      data,
      isRead,
      createdAt,
    );
  };
}
