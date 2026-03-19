import { NextFunction, Request, Response } from "express";
import { getExpertApplicationDetailsSchema } from "../../application/dtos/expert/GetExpertApplicationDetails.dto";
import { getExpertApplicationsSchema } from "../../application/dtos/expert/GetExpertApplications.dto";
import { submitExpertApplicationSchema } from "../../application/dtos/expert/SubmitExpertApplication.dto";
import { IGetExpertApplicationDetails } from "../../application/interfaces/expert-applications/IGetExpertApplicationDetails";
import { IGetExpertApplications } from "../../application/interfaces/expert-applications/IGetExpertApplications";
import { IApproveExpertApplication } from "../../application/interfaces/expert-applications/IApproveExpertApplication";
import { ISubmitExpertApplication } from "../../application/interfaces/expert-applications/ISubmitExpertApplication";
import { HttpStatus } from "../../constants/HttpStatus";
import { IRejectExpertApplication } from "../../application/interfaces/expert-applications/IRejectExpertApplication";

export class ExpertApplicationsController {
  constructor(
    private _submitExpertApplication: ISubmitExpertApplication,
    private _getExpertApplications: IGetExpertApplications,
    private _getExpertApplicationDetails: IGetExpertApplicationDetails,
    private _approveExpertApplication: IApproveExpertApplication,
    private _rejectExpertApplication: IRejectExpertApplication,
  ) {}

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

  getApplications = async (
    req: Request<
      {},
      any,
      any,
      {
        cursor?: string;
        limit?: string;
        status?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const cursor = req.query.cursor;
      let limit = 10;

      if (req.query.limit) {
        const parsed = parseInt(req.query.limit);
        if (!isNaN(parsed)) {
          limit = parsed;
        }
      }

      const dto = getExpertApplicationsSchema.parse({
        cursor,
        limit,
        filters: {
          status: req.query.status,
        },
      });

      const { applications, hasNextPage, nextCursor } =
        await this._getExpertApplications.exec(dto);

      res.status(HttpStatus.OK).json({
        success: true,
        data: applications,
        hasNextPage,
        nextCursor,
      });
    } catch (err) {
      next(err);
    }
  };

  getApplicationDetails = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = getExpertApplicationDetailsSchema.parse({
        applicationId: req.params.id,
      });

      const application = await this._getExpertApplicationDetails.exec(dto);

      res.status(HttpStatus.OK).json({
        success: true,
        data: application,
      });
    } catch (err) {
      next(err);
    }
  };

  approveApplication = async (
    req: Request<{ applicationId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const adminId = req.headers["x-user-id"] as string;

      await this._approveExpertApplication.exec(
        req.params.applicationId,
        adminId,
      );

      res.status(HttpStatus.OK).json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };

  rejectApplication = async (
    req: Request<{ applicationId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const adminId = req.headers["x-user-id"] as string;

      await this._rejectExpertApplication.exec(
        req.params.applicationId,
        adminId,
      );

      res.status(HttpStatus.OK).json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };
}
