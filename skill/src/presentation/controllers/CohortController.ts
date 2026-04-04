import type { NextFunction, Request, Response } from "express";
import type { ICohortService } from "../../application/interfaces/ICohortService";
import {
  createCohortDTO,
  enrollInCohortParamsDTO,
  getCohortParamsDTO,
  getCohortsQueryDTO,
  updateCohortBodyDTO,
  updateCohortParamsDTO,
} from "../../application/dtos/cohort.dto";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export class CohortController {
  constructor(private cohortService: ICohortService) {}

  createCohort = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createCohortDTO.parse({
        ...req.body,
        expertId: req.headers["x-user-id"],
      });

      const cohort = await this.cohortService.createCohort(dto);
      res.status(HttpStatus.CREATED).json({ success: true, data: cohort });
    } catch (error) {
      next(error);
    }
  };

  getCohorts = async (
    req: Request<{}, unknown, unknown, { workshopId?: string; status?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = getCohortsQueryDTO.parse({
        expertId: req.headers["x-user-id"],
        workshopId: req.query.workshopId,
        status: req.query.status,
      });

      const cohorts = await this.cohortService.getCohorts(dto);
      res.status(HttpStatus.OK).json({ success: true, data: cohorts });
    } catch (error) {
      next(error);
    }
  };

  getCohortById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = getCohortParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });

      const cohort = await this.cohortService.getCohortById(params);
      res.status(HttpStatus.OK).json({ success: true, data: cohort });
    } catch (error) {
      next(error);
    }
  };

  updateCohort = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = updateCohortParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });
      const body = updateCohortBodyDTO.parse(req.body);

      const cohort = await this.cohortService.updateCohort(
        params.id,
        params.expertId,
        body,
      );
      res.status(HttpStatus.OK).json({ success: true, data: cohort });
    } catch (error) {
      next(error);
    }
  };

  deleteCohort = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = getCohortParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });

      await this.cohortService.deleteCohort(params.id, params.expertId);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getCohortMembers = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = getCohortParamsDTO.parse({
        id: req.params.id,
        expertId: req.headers["x-user-id"],
      });

      const members = await this.cohortService.getCohortMembers(
        params.id,
        params.expertId,
      );
      res.status(HttpStatus.OK).json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  };

  enrollInCohort = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const params = enrollInCohortParamsDTO.parse({
        id: req.params.id,
        userId: req.headers["x-user-id"],
      });

      const enrollment = await this.cohortService.enrollInCohort(
        params.id,
        params.userId,
      );
      res.status(HttpStatus.CREATED).json({ success: true, data: enrollment });
    } catch (error) {
      next(error);
    }
  };
}
