import type { NextFunction, Request, Response } from "express";
import type { ISkillService } from "../../application/interfaces/ISkillService";
import { HttpStatus } from "../../constants/HttpStatusCodes";
import { createSkillDTO } from "../../application/dtos/skill.dto";
import { NotFoundError } from "../../domain/errors/NotFoundError";

export class SkillController {
  constructor(private _skillService: ISkillService) {}

  getSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id?.trim();
      if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: [{ message: "Skill ID is required", field: "id" }],
        });
        return;
      }

      const skill = await this._skillService.getSkillById(id);
      if (!skill) {
        throw new NotFoundError("Skill");
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
