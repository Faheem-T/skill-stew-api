import { injectable, inject } from "inversify";
import type { IUnreadNotificationCountService } from "../service-interfaces/IUnreadNotificationCountService";
import { TYPES } from "../../constants/Types";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";
import type { IUnreadNotificationCountCache } from "../ports/IUnreadNotificationCountCache";
import { NotFoundError } from "../../domain/errors";
import type { ILogger } from "../ports/ILogger";

@injectable()
export class UnreadNotificationCountService implements IUnreadNotificationCountService {
  constructor(
    @inject(TYPES.UnreadNotificationCountRepository)
    private _unreadNotificationCountRepo: IUnreadNotificationCountRepository,
    @inject(TYPES.UnreadNotificationCountCache)
    private _unreadNotificationCountCache: IUnreadNotificationCountCache,
    @inject(TYPES.Logger)
    private _logger: ILogger,
  ) {}

  getUnreadCountForUser = async (userId: string): Promise<number> => {
    let count: number | null;

    count = await this._unreadNotificationCountCache.getByUserId(userId);

    // cache miss
    if (count == null) {
      this._logger.warn("Cache miss for unread count for user", { userId });
      try {
        count = await this._unreadNotificationCountRepo.getByUserId(userId);
      } catch (err) {
        if (err instanceof NotFoundError) {
          count =
            await this._unreadNotificationCountRepo.createByUserId(userId);
        } else {
          throw err;
        }
      }

      await this._unreadNotificationCountCache.setByUserId(userId, count);
    } else {
      this._logger.info("Returning value from cache for unread count", {
        userId,
      });
    }

    return count;
  };
}
