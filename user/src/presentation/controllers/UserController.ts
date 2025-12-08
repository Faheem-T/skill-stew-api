import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@skillstew/common";
// import { IDSchema } from "../validators/IdValidator";
import { UserFilters } from "../../domain/repositories/IUserRepository";
import { updateProfileSchema } from "../../application/dtos/user/UpdateUserProfile.dto";
import { IUpdateUserProfile } from "../../application/interfaces/user/IUpdateUserProfile";
import { IGetUsers } from "../../application/interfaces/admin/IGetUsers";
import { getUsersSchema } from "../../application/dtos/admin/GetUsers.dto";
import { updateUserBlockStatusSchema } from "../../application/dtos/admin/UpdateUserBlockStatus.dto";
import { IUpdateUserBlockStatus } from "../../application/interfaces/admin/IUpdateUserBlockStatus";

export class UserController {
  constructor(
    private _updateUserProfile: IUpdateUserProfile,
    private _getUsers: IGetUsers,
    private _updateUserBlockStatus: IUpdateUserBlockStatus,
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

  // userProfileUpdate = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) => {
  //   try {
  //     const id = req.headers["x-user-id"];
  //     const dto = updateProfileSchema.parse({ id, ...req.body });
  //     const updatedUser = await this._updateUserProfile.exec(dto);
  //     if (updatedUser === null) {
  //       res
  //         .status(HttpStatus.NOT_FOUND)
  //         .json({ success: false, message: "User not found" });
  //       return;
  //     }
  //     res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: "User profile updated",
  //       data: updatedUser,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
}
