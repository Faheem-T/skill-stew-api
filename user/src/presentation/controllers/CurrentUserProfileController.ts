import { HttpStatus } from "@skillstew/common";
import { NextFunction, Request, Response } from "express";
import { IGetCurrentUserProfile } from "../../application/interfaces/user/IGetCurrentUserProfile";
import { USER_ROLES, UserRoles } from "../../domain/entities/UserRoles";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { IGetCurrentExpertProfile } from "../../application/interfaces/expert/IGetCurrentExpertProfile";
import { IGeneratePresignedUploadUrl } from "../../application/interfaces/common/IGeneratePresignedUploadUrl";
import { generatePresignedUploadUrlSchema } from "../../application/dtos/common/GeneratePresignedUploadUrl.dto";
import { IGetCurrentAdminProfile } from "../../application/interfaces/admin/IGetCurrentAdminProfile";
import { updateProfileSchema } from "../../application/dtos/user/UpdateUserProfile.dto";
import { IUpdateUserProfile } from "../../application/interfaces/user/IUpdateUserProfile";

export class CurrentUserProfileController {
  constructor(
    private _getCurrentUserProfile: IGetCurrentUserProfile,
    private _getCurrentExpertProfile: IGetCurrentExpertProfile,
    private _generatePresignedUploadUrl: IGeneratePresignedUploadUrl,
    private _getCurrentAdminProfile: IGetCurrentAdminProfile,
    private _updateUserProfile: IUpdateUserProfile,
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

  generateUploadPresignedUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const userRole = req.headers["x-user-role"] as UserRoles;
      const dto = generatePresignedUploadUrlSchema.parse({
        userId,
        userRole,
        ...req.body,
      });
      const { uploadUrl, key } =
        await this._generatePresignedUploadUrl.exec(dto);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          uploadUrl,
          key,
        },
      });
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
      const userId = req.headers["x-user-id"];
      const dto = updateProfileSchema.parse({ userId, ...req.body });
      const updatedUser = await this._updateUserProfile.exec(dto);
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
