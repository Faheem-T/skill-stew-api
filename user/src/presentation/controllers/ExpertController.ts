import { NextFunction, Request, Response } from "express";
import { submitExpertApplicationSchema } from "../../application/dtos/expert/SubmitExpertApplication.dto";
import { ISubmitExpertApplication } from "../../application/interfaces/expert/ISubmitExpertApplication";
import { HttpStatus } from "../../constants/HttpStatus";

export class ExpertController {
  constructor(private _submitExpertApplication: ISubmitExpertApplication) {}

  apply = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const applicationDto = submitExpertApplicationSchema.parse(req.body);

      // Extract userId from JWT if needed later, right now the application is
      // not explicitly tied to a userId per business requirements.
      // const userId = req.headers["x-user-id"] as string;

      const result = await this._submitExpertApplication.exec(applicationDto);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
