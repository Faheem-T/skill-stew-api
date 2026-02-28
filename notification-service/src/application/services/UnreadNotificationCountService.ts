import { injectable, inject } from "inversify";
import type { IUnreadNotificationCountService } from "../service-interfaces/IUnreadNotificationCountService";
import { TYPES } from "../../constants/Types";
import type { IUnreadNotificationCountRepository } from "../../domain/repositories/IUnreadNotificationCountRepository";

@injectable()
export class UnreadNotificationCountService implements IUnreadNotificationCountService {
  constructor(
    @inject(TYPES.UnreadNotificationCountRepository)
    private _unreadNotificationCountRepo: IUnreadNotificationCountRepository,
  ) {}

  getUnreadCountForUser = async (userId: string): Promise<number> => {
    return this._unreadNotificationCountRepo.getByUserId(userId);
  };
}
