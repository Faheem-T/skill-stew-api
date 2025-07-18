import { NextFunction, Request, Response } from "express-serve-static-core";
import { UserUsecases } from "../../1-application/UserUsecases";
import { HttpStatus } from "../../constants/HttpStatus";
import { IDSchema } from "../validators/IdValidator";

export class UserController {
  constructor(private _userUsecases: UserUsecases) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await this._userUsecases.getAllUsers();
    res.status(HttpStatus.OK).json({ success: true, data: users });
  };

  blockUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = IDSchema.parse(req.params.id);

      const user = await this._userUsecases.blockUser(userId);

      if (!user) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }

      res.status(HttpStatus.OK).json({ message: "User has been blocked." });
    } catch (err) {
      next(err);
    }
  };
  unblockUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = IDSchema.parse(req.params.id);

      const user = await this._userUsecases.unblockUser(userId);

      if (!user) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }

      res.status(HttpStatus.OK).json({ message: "User has been unblocked" });
    } catch (err) {
      next(err);
    }
  };
}
