import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@skillstew/common";
import { UserFilters } from "../../domain/repositories/IUserRepository";
import { IGetUsers } from "../../application/interfaces/admin/IGetUsers";
import { getUsersSchema } from "../../application/dtos/admin/GetUsers.dto";
import { updateUserBlockStatusSchema } from "../../application/dtos/admin/UpdateUserBlockStatus.dto";
import { IUpdateUserBlockStatus } from "../../application/interfaces/admin/IUpdateUserBlockStatus";
import { checkUsernameAvailabilitySchema } from "../../application/dtos/common/CheckUsernameAvailability.dto";
import { ICheckUsernameAvailability } from "../../application/interfaces/common/ICheckUsernameAvailability";
import { updateUsernameSchema } from "../../application/dtos/common/UpdateUsername.dto";
import { IUpdateUsername } from "../../application/interfaces/common/IUpdateUsername";

export class UserController {
  constructor(
    private _getUsers: IGetUsers,
    private _updateUserBlockStatus: IUpdateUserBlockStatus,
    private _checkUsernameAvailability: ICheckUsernameAvailability,
    private _updateUsername: IUpdateUsername,
  ) {}

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

      const dto = getUsersSchema.parse({ cursor, limit, filters });

      const { users, nextCursor, hasNextPage } = await this._getUsers.exec(dto);

      res
        .status(HttpStatus.OK)
        .json({ success: true, data: users, hasNextPage, nextCursor });
    } catch (err) {
      next(err);
    }
  };

  updateUserBlockStatus = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = updateUserBlockStatusSchema.parse({
        ...req.body,
        userId: req.params.id,
      });

      const updatedUser = await this._updateUserBlockStatus.exec(dto);

      if (!updatedUser) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }

      res.status(HttpStatus.OK).json({ data: updatedUser });
    } catch (err) {
      next(err);
    }
  };

  usernameAvailabilityCheck = async (
    req: Request<{}, {}, {}, { username: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      console.log(req.query);
      const dto = checkUsernameAvailabilitySchema.parse({
        username: req.query.username,
      });

      const { available } = await this._checkUsernameAvailability.exec(dto);

      res.status(HttpStatus.OK).json({ data: { available } });
    } catch (err) {
      next(err);
    }
  };

  updateUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = updateUsernameSchema.parse({
        userId: req.headers["x-user-id"],
        username: req.body.username,
      });

      await this._updateUsername.exec(dto);

      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Your username has been changed." });
    } catch (err) {
      next(err);
    }
  };
}
