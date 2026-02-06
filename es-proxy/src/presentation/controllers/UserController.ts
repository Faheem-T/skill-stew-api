import { NextFunction, Request, Response } from "express";
import { IUserService } from "../../application/interfaces/IUserService";
import { HttpStatus } from "@skillstew/common";
import { ValidationError } from "../../application/errors/ValidationError";

export class UserController {
  constructor(private _userService: IUserService) {}

  getRecommendedUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId || typeof userId !== "string") {
        throw new ValidationError([{
          message: "User ID is required and must be a string",
          field: "x-user-id"
        }]);
      }

      const recommendedUsers =
        await this._userService.getRecommendedUsers(userId);

      res.status(HttpStatus.OK).json({ success: true, data: recommendedUsers });
    } catch (err) {
      next(err);
    }
  };
}
