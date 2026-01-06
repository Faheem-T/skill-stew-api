import { NextFunction, Request, Response } from "express";
import { ISkillService } from "../../application/interfaces/ISkillService";
import { HttpStatus } from "@skillstew/common";

export class SkillController {
  constructor(private _skillService: ISkillService) {}

  search = async (
    req: Request<{}, any, any, { query: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.query.query) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "`query` is required." });
        return;
      }
      const skills = await this._skillService.search(req.query.query as string);
      res.status(HttpStatus.OK).json({ data: skills });
    } catch (err) {
      next(err);
    }
  };
}
