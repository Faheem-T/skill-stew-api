import { NextFunction, Request, Response } from "express";
import { ISkillService } from "../../application/interfaces/ISkillService";
import { HttpStatus } from "@skillstew/common";
import { ValidationError } from "../../application/errors/ValidationError";

export class SkillController {
  constructor(private _skillService: ISkillService) {}

  search = async (
    req: Request<{}, any, any, { query: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.query.query) {
        throw new ValidationError([{
          message: "Query parameter is required",
          field: "query"
        }]);
      }
      const skills = await this._skillService.search(req.query.query as string);
      res.status(HttpStatus.OK).json({ success: true, data: skills });
    } catch (err) {
      next(err);
    }
  };
}
