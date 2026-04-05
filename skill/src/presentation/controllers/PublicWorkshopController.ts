import type { NextFunction, Request, Response } from "express";
import type { ICohortService } from "../../application/interfaces/ICohortService";
import { publicWorkshopParamsDTO } from "../../application/dtos/cohort.dto";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export class PublicWorkshopController {
  constructor(private cohortService: ICohortService) {}

  getPublicWorkshopById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = publicWorkshopParamsDTO.parse({
        id: req.params.id,
        userId:
          typeof req.headers["x-user-role"] === "string" &&
          req.headers["x-user-role"] === "USER"
            ? req.headers["x-user-id"]
            : undefined,
      });

      const workshop = await this.cohortService.getPublicWorkshopById(params);
      res.status(HttpStatus.OK).json({ success: true, data: workshop });
    } catch (error) {
      next(error);
    }
  };
}
