import { NextFunction, Request, Response } from "express";
import { IAcceptConnection } from "../../application/interfaces/user/IAcceptConnection";
import { IRejectConnection } from "../../application/interfaces/user/IRejectConnection";
import { ISendConnectionRequest } from "../../application/interfaces/user/ISendConnectionRequest";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ValidationError } from "../../application/errors/ValidationError";
import { HttpStatus } from "@skillstew/common";

export class ConnectionController {
  constructor(
    private _sendConnectionRequest: ISendConnectionRequest,
    private _acceptConnection: IAcceptConnection,
    private _rejectConnection: IRejectConnection,
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

      await this._sendConnectionRequest.exec(userId, recipientId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Connection request sent!" });
    } catch (err) {
      next(err);
    }
  };
}
