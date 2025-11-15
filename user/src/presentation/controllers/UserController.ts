import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@skillstew/common";
import { IDSchema } from "../validators/IdValidator";
import { UserFilters } from "../../domain/repositories/IUserRepository";
import { IUserUsecases } from "../../application/interfaces/IUserUsecases";
import { updateProfileSchema } from "../../application/dtos/user/UpdateProfileDTO";
import { IUserProfileUpdate } from "../../application/interfaces/user/IUserProfileUpdate";

export class UserController {
  constructor(
    private _userUsecases: IUserUsecases,
    private _userProfileUpdateUsecase: IUserProfileUpdate,
  ) {}

  createDummyUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._userUsecases.createDummyUsers();
      res.status(HttpStatus.OK).json({ message: "Created", success: true });
    } catch (err) {
      next(err);
    }
  };

  getAllUsers = async (
    req: Request<
      {},
      any,
      any,
      {
        cursor?: string;
        limit?: string;
        query?: string;
        isVerified?: boolean;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const cursor = req.query.cursor;
      let limit = 10;
      if (req.query.limit) {
        const int = parseInt(req.query.limit);
        if (!isNaN(int)) {
          limit = int;
        }
      }

      const filters: UserFilters = {
        query: req.query.query,
        isVerified: req.query.isVerified,
      };
      const { users, nextCursor, hasNextPage } =
        await this._userUsecases.getAllUsers({
          cursor,
          limit,
          filters,
        });
      res
        .status(HttpStatus.OK)
        .json({ success: true, data: users, hasNextPage, nextCursor });
    } catch (err) {
      next(err);
    }
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

  userProfileUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.headers["x-user-id"];
      const dto = updateProfileSchema.parse({ id, ...req.body });
      const updatedUser = await this._userProfileUpdateUsecase.exec(dto);
      if (updatedUser === null) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }
      res.status(HttpStatus.OK).json({
        success: true,
        message: "User profile updated",
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  };
}
