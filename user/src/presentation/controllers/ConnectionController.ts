import { NextFunction, Request, Response } from "express";
import { IAcceptConnection } from "../../application/interfaces/user/IAcceptConnection";
import { IRejectConnection } from "../../application/interfaces/user/IRejectConnection";
import { ISendConnectionRequest } from "../../application/interfaces/user/ISendConnectionRequest";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ValidationError } from "../../application/errors/ValidationError";
import { HttpStatus } from "../../constants/HttpStatus";
import { getConnectionStatusToUserSchema } from "../../application/dtos/user/GetConnectionStatusToUser.dto";
import { IGetConnectionStatusToUser } from "../../application/interfaces/user/IGetConnectionStatusToUser";
import { IGetAllConnectedUserIds } from "../../application/interfaces/user/IGetAllConnectedUserIds";
import { IGetConnectedUsers } from "../../application/interfaces/user/IGetConnectedUsers";
import { getConnectedUsersSchema } from "../../application/dtos/user/GetConnectedUsers.dto";

export class ConnectionController {
  constructor(
    private _sendConnectionRequest: ISendConnectionRequest,
    private _acceptConnection: IAcceptConnection,
    private _rejectConnection: IRejectConnection,
    private _getConnectionStatusToUser: IGetConnectionStatusToUser,
    private _getAllConnectedUserIdsUsecase: IGetAllConnectedUserIds,
    private _getConnectedUsersUsecase: IGetConnectedUsers,
  ) {}

  sendConnectionRequest = async (
    req: Request<{ userId: string | undefined }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        throw new ForbiddenError();
      }

      const recipientId = req.params.userId;

      if (!recipientId) {
        throw new ValidationError([{ message: "recipientId is required" }]);
      }

      const connectionStatus = await this._sendConnectionRequest.exec(
        userId,
        recipientId,
      );

      if (connectionStatus === "ACCEPTED") {
        res.status(HttpStatus.OK).json({
          success: true,
          data: { connectionStatus },
          message:
            "Connection request accepted as you already had a connection request from this user",
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: { connectionStatus },
        message: "Connection request sent!",
      });
    } catch (err) {
      next(err);
    }
  };

  acceptConnectionRequest = async (
    req: Request<{ connectionId: string | undefined }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        throw new ForbiddenError();
      }

      const connectionId = req.params.connectionId;

      if (!connectionId) {
        throw new ValidationError([{ message: "connectionId is required" }]);
      }

      await this._acceptConnection.exec(connectionId, userId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Connection request accepted successfully!",
      });
    } catch (err) {
      next(err);
    }
  };

  rejectConnectionRequest = async (
    req: Request<{ connectionId: string | undefined }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        throw new ForbiddenError();
      }

      const connectionId = req.params.connectionId;

      if (!connectionId) {
        throw new ValidationError([{ message: "connectionId is required" }]);
      }

      await this._rejectConnection.exec(connectionId, userId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Connection request rejected." });
    } catch (err) {
      next(err);
    }
  };

  getConnectionStatusToUser = async (
    req: Request<{ targetId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = getConnectionStatusToUserSchema.parse({
        userId: req.headers["x-user-id"],
        targetId: req.params.targetId,
      });

      const { status, connectionId } =
        await this._getConnectionStatusToUser.exec(dto);

      res
        .status(HttpStatus.OK)
        .json({ success: true, data: { status, connectionId } });
    } catch (err) {
      next(err);
    }
  };

  getAllConnectedUserIds = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        throw new ValidationError([
          { message: "userId is required", field: "userId" },
        ]);
      }

      if (typeof userId !== "string") {
        throw new ValidationError([
          { message: "invalid userId", field: "userId" },
        ]);
      }

      const connectedUsers =
        await this._getAllConnectedUserIdsUsecase.exec(userId);

      res.status(HttpStatus.OK).json({ success: true, data: connectedUsers });
    } catch (err) {
      next(err);
    }
  };

  getConnectedUsers = async (
    req: Request<{ userId: string }, any, any, { limit?: string; cursor?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = getConnectedUsersSchema.parse({
        userId: req.params.userId,
        limit: req.query.limit,
        cursor: req.query.cursor,
      });

      const { users, hasNextPage, nextCursor } =
        await this._getConnectedUsersUsecase.exec(dto);

      res
        .status(HttpStatus.OK)
        .json({ success: true, data: users, hasNextPage, nextCursor });
    } catch (err) {
      next(err);
    }
  };
}
