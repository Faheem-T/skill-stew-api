import type { NextFunction, Request, Response } from "express";
import type { IWorkshopService } from "../../application/interfaces/IWorkshopService";
import {
  createWorkshopDTO,
  updateWorkshopBodyDTO,
  updateWorkshopParamsDTO,
} from "../../application/dtos/workshop.dto";
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

  updateWorkshop = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = updateWorkshopParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });
      const dto = updateWorkshopBodyDTO.parse(req.body);

      const workshop = await this.workshopService.updateWorkshop(
        params.id,
        params.expertId,
        dto,
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: workshop,
      });
    } catch (err) {
      next(err);
    }
  };
}
