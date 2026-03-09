import { injectable, inject } from "inversify";
import type Redis from "ioredis";
import type { IUnreadNotificationCountCache } from "../../application/ports/IUnreadNotificationCountCache";
import { TYPES } from "../../constants/Types";
import { NotFoundError } from "../../domain/errors";
import { CacheConstraintError } from "../../application/errors/infra/CacheConstraintError";

@injectable()
export class RedisUnreadNotificationCountCache implements IUnreadNotificationCountCache {
  private _ttlSeconds = 60 * 30; // 30 minutes
  constructor(@inject(TYPES.RedisClient) private _redisClient: Redis) {}

  getByUserId = async (userId: string): Promise<number | null> => {
    const count = await this._redisClient.get(`unreadCount:${userId}`);

    return count != null ? Number(count) : count;
  };

  setByUserId = async (userId: string, count: number): Promise<number> => {
    await this._redisClient.set(
      `unreadCount:${userId}`,
      count,
      "EX",
      this._ttlSeconds,
    );
    return count;
  };

  incrementByUserId = async (userId: string, inc: number): Promise<number> => {
    // redis sets the value to 0 and increments if the key does not exist
    const result = await this._redisClient.incrby(`unreadCount:${userId}`, inc);
    return result;
  };

  decrementByUserId = async (userId: string, dec: number): Promise<number> => {
    // redis sets the value to 0 and decrements if the key does not exist
    // so a check is needed for the current value
    const existing = await this._redisClient.get(`unreadCount:${userId}`);
    if (!existing) {
      throw new NotFoundError("Unread count cache");
    }

    if (Number(existing) < dec) {
      throw new CacheConstraintError(
        `Unread count cannot be less than 0. Trying to decrement ${dec} from ${existing}.`,
      );
    }

    const result = await this._redisClient.decrby(`unreadCount:${userId}`, dec);

    return result;
  };
}
