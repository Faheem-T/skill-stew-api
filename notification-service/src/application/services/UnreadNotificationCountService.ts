import { injectable, inject } from "inversify";
import type { IUnreadNotificationCountService } from "../service-interfaces/IUnreadNotificationCountService";
import { TYPES } from "../../constants/Types";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";
import type { IUnreadNotificationCountCache } from "../ports/IUnreadNotificationCountCache";
import { NotFoundError } from "../../domain/errors";

@injectable()
export class UnreadNotificationCountService implements IUnreadNotificationCountService {
  constructor(
    @inject(TYPES.UnreadNotificationCountRepository)
    private _unreadNotificationCountRepo: IUnreadNotificationCountRepository,
    @inject(TYPES.UnreadNotificationCountCache)
    private _unreadNotificationCountCache: IUnreadNotificationCountCache,
  ) {}

  getUnreadCountForUser = async (userId: string): Promise<number> => {
    let count: number | null;

    count = await this._unreadNotificationCountCache.getByUserId(userId);

    // cache miss
    if (!count) {
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
    }

    return count;
  };
}
