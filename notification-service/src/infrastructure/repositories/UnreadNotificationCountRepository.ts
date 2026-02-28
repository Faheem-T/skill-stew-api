import { injectable } from "inversify";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";
import { UnreadNotificationCountModel } from "../models/UnreadNotificationCountModel";
import { NotFoundError } from "../../domain/errors";
import { mapMongooseError } from "../mappers/mapMongooseError";

@injectable()
export class UnreadNotificationCountRepository implements IUnreadNotificationCountRepository {
  private _model = UnreadNotificationCountModel;

  getByUserId = async (userId: string): Promise<number> => {
    try {
      const foundCount = await this._model.findOne({ userId });

      if (!foundCount) {
        throw new NotFoundError("Unread count");
      }

      return foundCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  createByUserId = async (userId: string): Promise<number> => {
    try {
      const newUnreadCount = this._model.build({ userId, unreadCount: 0 });
      const savedUnreadCount = await newUnreadCount.save();
      return savedUnreadCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  incrementByUserId = async (userId: string, inc: number): Promise<number> => {
    try {
      const newUnreadCount = await this._model.findOneAndUpdate(
        { userId },
        { $inc: { unreadCount: inc } },
      );

      if (!newUnreadCount) {
        throw new NotFoundError("Unread count");
      }

      return newUnreadCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  decrementByUserId = async (userId: string, dec: number): Promise<number> => {
    try {
      const newUnreadCount = await this._model.findOneAndUpdate(
        { userId },
        { $inc: { unreadCount: -dec } },
      );

      if (!newUnreadCount) {
        throw new NotFoundError("Unread count");
      }

      return newUnreadCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };
}
