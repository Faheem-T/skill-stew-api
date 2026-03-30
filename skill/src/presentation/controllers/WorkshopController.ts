import type { NextFunction, Request, Response } from "express";
import type { IWorkshopService } from "../../application/interfaces/IWorkshopService";
import { createWorkshopDTO } from "../../application/dtos/workshop.dto";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export class WorkshopController {
  constructor(private workshopService: IWorkshopService) {}

  createWorkshop = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = createWorkshopDTO.parse({
        ...req.body,
        expertId: req.headers["x-user-id"],
      });

      const workshop = await this.workshopService.createWorkshop(dto);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: workshop,
      });
    } catch (err) {
      next(err);
    }
  };
}
