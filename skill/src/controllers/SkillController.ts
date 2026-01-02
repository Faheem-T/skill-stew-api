import type { NextFunction, Request, Response } from "express";
import type { ISkillService } from "../interfaces/service-interfaces/ISkillService";
import { HttpStatus } from "../constants/HttpStatusCodes";
import { ResponseMessages } from "../constants/ResponseMessages";
import { createSkillDTO } from "../dtos/skill.dto";

export class SkillController {
  constructor(private _skillService: ISkillService) {}

  getSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id?.trim();
      if (!id) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: ResponseMessages.ID_REQUIRED });
        return;
      }

      const skill = await this._skillService.getSkillById(id);
      if (!skill) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: ResponseMessages.SKILL_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, data: skill });
    } catch (err) {
      next(err);
    }
  };

  createSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createSkillDTO.parse(req.body);
      const skill = await this._skillService.createSkill(dto);
      res.status(HttpStatus.OK).json({ success: true, data: skill });
    } catch (err) {
      next(err);
    }
  };
}
