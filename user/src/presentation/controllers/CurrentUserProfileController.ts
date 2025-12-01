import { HttpStatus } from "@skillstew/common";
import { NextFunction, Request, Response } from "express";
import { IGetCurrentUserProfile } from "../../application/interfaces/user/IGetCurrentUserProfile";
import { USER_ROLES, UserRoles } from "../../domain/entities/UserRoles";
import { ForbiddenError } from "../errors/ForbiddenError";
import { IGetCurrentExpertProfile } from "../../application/interfaces/expert/IGetCurrentExpertProfile";
import { IGetCurrentAdminProfile } from "../../application/interfaces/admin/IGetCurrentAdminProfile";

export class CurrentUserProfileController {
  constructor(
    private _getCurrentUserProfile: IGetCurrentUserProfile,
    private _getCurrentExpertProfile: IGetCurrentExpertProfile,
    private _getCurrentAdminProfile: IGetCurrentAdminProfile,
  ) {}

  getCurrentUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.headers["x-user-id"] as string;
      const role = req.headers["x-user-role"] as UserRoles;

      if (!id || !role || !USER_ROLES.includes(role)) {
        throw new ForbiddenError();
      }

      let profile;
      switch (role) {
        case "USER":
          profile = await this._getCurrentUserProfile.exec(id);
          break;
        case "EXPERT":
          profile = await this._getCurrentExpertProfile.exec(id);
          break;
        case "ADMIN":
          profile = await this._getCurrentAdminProfile.exec(id);
          break;
      }

      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
