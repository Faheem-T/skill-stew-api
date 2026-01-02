import type { NextFunction, Response, Request } from "express";
import type { ISkillProfileService } from "../interfaces/service-interfaces/ISkillProfileService";
import { saveSkillProfileDTO } from "../dtos/skillProfile.dto";
import { HttpStatus } from "../constants/HttpStatusCodes";

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
}
