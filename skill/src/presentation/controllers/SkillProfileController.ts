import type { NextFunction, Response, Request } from "express";
import type { ISkillProfileService } from "../../application/interfaces/ISkillProfileService";
import { saveSkillProfileDTO } from "../../application/dtos/skillProfile.dto";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export class SkillProfileController {
  constructor(private _skillProfileService: ISkillProfileService) {}

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = saveSkillProfileDTO.parse({
        ...req.body,
        id: req.headers["x-user-id"],
      });

      const { id, wanted, offered, createdAt, updatedAt } =
        await this._skillProfileService.saveProfile(dto);

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Skill profile updated",
        data: { id, wanted, offered, createdAt, updatedAt },
      });
    } catch (err) {
      next(err);
    }
  };

  getCurrentUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId || typeof userId !== "string") {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "User ID is required." });
        return;
      }

      const profile = await this._skillProfileService.getProfile(userId);
      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
