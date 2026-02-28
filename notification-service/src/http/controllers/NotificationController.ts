import { injectable, inject } from "inversify";
import type { NextFunction, Request, Response } from "express";
import { TYPES } from "../../constants/Types";
import { HttpStatus } from "../../constants/HttpStatusCodes";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { UnauthorizedAccessError } from "../../domain/errors";
import type { IUnreadNotificationCountService } from "../../application/service-interfaces/IUnreadNotificationCountService";

const DEFAULT_LIMIT = 20;

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.UnreadNotificationCountService)
    private _unreadNotificationCountService: IUnreadNotificationCountService,
  ) {}

  getNotifications = async (
    req: Request<{}, any, any, { cursor?: string; limit?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        throw new UnauthorizedAccessError();
      }

      const cursor = req.query.cursor;
      const limit = Number(req.query.limit) || DEFAULT_LIMIT;

      const { notifications, hasNextPage, nextCursor } =
        await this._notificationService.getNotificationsForUser({
          userId,
          lastReadId: cursor,
          limit,
        });

      res
        .status(HttpStatus.OK)
        .json({ success: true, data: notifications, hasNextPage, nextCursor });
    } catch (err) {
      next(err);
    }
  };

  markRead = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        throw new UnauthorizedAccessError();
      }

      const notificationId = req.params.id;

      const notification = await this._notificationService.markRead(
        notificationId,
        userId,
      );

      res.status(HttpStatus.OK).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        throw new UnauthorizedAccessError();
      }

      const unreadCount =
        await this._unreadNotificationCountService.getUnreadCountForUser(
          userId,
        );

      res.status(200).json({ success: true, data: unreadCount });
    } catch (err) {
      next(err);
    }
  };
}
