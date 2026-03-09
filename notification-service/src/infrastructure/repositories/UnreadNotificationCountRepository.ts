import { injectable } from "inversify";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";
import { UnreadNotificationCountModel } from "../models/UnreadNotificationCountModel";
import { NotFoundError } from "../../domain/errors";
import { mapMongooseError } from "../mappers/mapMongooseError";
import type { TransactionContext } from "../../types/TransactionContext";

@injectable()
export class UnreadNotificationCountRepository implements IUnreadNotificationCountRepository {
  private _model = UnreadNotificationCountModel;

  getByUserId = async (
    userId: string,
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      const foundCount = await this._model.findOne(
        { userId },
        {},
        { session: tx },
      );

      if (!foundCount) {
        throw new NotFoundError("Unread count");
      }

      return foundCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  createByUserId = async (
    userId: string,
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      const newUnreadCount = this._model.build({ userId, unreadCount: 0 });
      const savedUnreadCount = await newUnreadCount.save({ session: tx });
      return savedUnreadCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  incrementByUserId = async (
    userId: string,
    inc: number,
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      const savedCount = await this._model.findOneAndUpdate(
        { userId },
        { $inc: { unreadCount: inc } },
        { session: tx, upsert: true, new: true },
      );

      if (!savedCount) {
        throw new NotFoundError("Unread count");
      }

      return savedCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };

  decrementByUserId = async (
    userId: string,
    dec: number,
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      const savedCount = await this._model.findOneAndUpdate(
        { userId },
        { $inc: { unreadCount: -dec } },
        { session: tx },
      );

      if (!savedCount) {
        throw new NotFoundError("Unread count");
      }

      return savedCount.unreadCount;
    } catch (err) {
      throw mapMongooseError(err);
    }
  };
}
