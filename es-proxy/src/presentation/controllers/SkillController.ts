import { NextFunction, Request, Response } from "express";
import { ISkillService } from "../../application/interfaces/ISkillService";
import { HttpStatus } from "@skillstew/common";

export class SkillController {
  constructor(private _skillService: ISkillService) {}

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.query.query);
      const skills = await this._skillService.search(req.query.query as string);
      res.status(HttpStatus.OK).json({ data: skills });
    } catch (err) {
      next(err);
    }
  };
}
