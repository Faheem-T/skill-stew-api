import { HttpStatus } from "@skillstew/common";
import { NextFunction, Request, Response } from "express";
import { onboardingUpdateUserProfileSchema } from "../../application/dtos/user/OnboardingUpdateProfile.dto";
import { IOnboardingUpdateUserProfile } from "../../application/interfaces/user/IOnbaordingUpdateProfile";

export class UserOnboardingController {
  constructor(
    private _onboardingUpdateUserProfile: IOnboardingUpdateUserProfile,
  ) { }

  onboardingUserProfileUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = req.headers["x-user-id"];
      const dto = onboardingUpdateUserProfileSchema.parse({ id, ...req.body });
      const updatedUser = await this._onboardingUpdateUserProfile.exec(dto);
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
  }
}
