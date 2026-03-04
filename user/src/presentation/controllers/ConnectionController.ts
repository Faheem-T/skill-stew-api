import { NextFunction, Request, Response } from "express";
import { IAcceptConnection } from "../../application/interfaces/user/IAcceptConnection";
import { IRejectConnection } from "../../application/interfaces/user/IRejectConnection";
import { ISendConnectionRequest } from "../../application/interfaces/user/ISendConnectionRequest";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ValidationError } from "../../application/errors/ValidationError";
import { HttpStatus } from "@skillstew/common";
import { getConnectionStatusToUserSchema } from "../../application/dtos/user/GetConnectionStatusToUser.dto";
import { IGetConnectionStatusToUser } from "../../application/interfaces/user/IGetConnectionStatusToUser";

export class ConnectionController {
  constructor(
    private _sendConnectionRequest: ISendConnectionRequest,
    private _acceptConnection: IAcceptConnection,
    private _rejectConnection: IRejectConnection,
    private _getConnectionStatusToUser: IGetConnectionStatusToUser,
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

      res.status(200).json({ success: true, data: { status, connectionId } });
    } catch (err) {
      next(err);
    }
  };
}
