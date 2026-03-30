import type { NextFunction, Request, Response } from "express";
import type { IWorkshopService } from "../../application/interfaces/IWorkshopService";
import {
  createWorkshopDTO,
  publishWorkshopParamsDTO,
  replaceWorkshopSessionsBodyDTO,
  replaceWorkshopSessionsParamsDTO,
  updateWorkshopBodyDTO,
  updateWorkshopParamsDTO,
  updateWorkshopSessionBodyDTO,
  updateWorkshopSessionParamsDTO,
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

  replaceWorkshopSessions = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = replaceWorkshopSessionsParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });
      const dto = replaceWorkshopSessionsBodyDTO.parse(req.body);

      const sessions = await this.workshopService.replaceWorkshopSessions(
        params.id,
        params.expertId,
        dto,
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: sessions,
      });
    } catch (err) {
      next(err);
    }
  };

  updateWorkshopSession = async (
    req: Request<{ id: string; sessionId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = updateWorkshopSessionParamsDTO.parse({
        id: req.params.id,
        sessionId: req.params.sessionId,
        expertId: req.headers["x-user-id"],
      });
      const dto = updateWorkshopSessionBodyDTO.parse(req.body);

      const session = await this.workshopService.updateWorkshopSession(
        params.id,
        params.sessionId,
        params.expertId,
        dto,
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  };

  publishWorkshop = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = publishWorkshopParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });

      const workshop = await this.workshopService.publishWorkshop(params);

      res.status(HttpStatus.OK).json({
        success: true,
        data: workshop,
      });
    } catch (err) {
      next(err);
    }
  };
}
