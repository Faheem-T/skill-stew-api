import { injectable } from "inversify";
import { Notification } from "../../domain/entities/Notification";
import { NotFoundError } from "../../domain/errors";
import type { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { mapMongooseError } from "../mappers/mapMongooseError";
import { NotificationModel } from "../models/NotificationModel";
import type {
  NotificationAttr,
  NotificationDoc,
} from "../models/NotificationModel";
import type { TransactionContext } from "../../types/TransactionContext";

@injectable()
export class NotificationRepository implements INotificationRepository {
  private model = NotificationModel;

  create = async (
    entity: Exclude<Notification, Notification["id"]>,
    tx?: TransactionContext,
  ): Promise<Notification> => {
    try {
      const attr = this.toPersistence(entity);
      const notification = this.model.build(attr);
      const savedNotification = await notification.save({ session: tx });
      return this.toDomain(savedNotification);
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  markRead = async (
    id: string,
    recipientId: string,
    tx?: TransactionContext,
  ): Promise<Notification> => {
    try {
      const foundNotification = await this.model.findOne(
        { _id: id, recipientId },
        {},
        { session: tx },
      );
      if (!foundNotification) {
        throw new NotFoundError("Notification");
      }
      foundNotification.isRead = true;
      const savedNotification = await foundNotification.save({ session: tx });
      return this.toDomain(savedNotification);
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  getNotificationsForUser = async (
    userId: string,
    lastReadId: string | undefined,
    limit: number,
  ): Promise<{
    notifications: Notification[];
    hasNextPage: boolean;
    nextCursor?: string;
  }> => {
    try {
      const query: Record<string, unknown> = { recipientId: userId };
      if (lastReadId) {
        query._id = { $lt: lastReadId };
      }
      const rows = await this.model
        .find(query)
        .sort({ _id: -1 })
        .limit(limit + 1);

      const hasNextPage = rows.length > limit;
      const sliced = hasNextPage ? rows.slice(0, -1) : rows;

      const notifications = sliced.map(this.toDomain);

      return {
        hasNextPage,
        nextCursor: hasNextPage ? rows[rows.length - 1]?.id! : undefined,
        notifications,
      };
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  findById = async (id: string): Promise<Notification> => {
    try {
      const notification = await this.model.findById(id);

      if (!notification) {
        throw new NotFoundError("Notification");
      }

      return this.toDomain(notification);
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
