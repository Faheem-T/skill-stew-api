import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import {
  GetExpertApplicationsDTO,
  ExpertApplicationListItemDTO,
  GetExpertApplicationsOutputDTO,
} from "../../dtos/expert/GetExpertApplications.dto";
import { IGetExpertApplications } from "../../interfaces/expert/IGetExpertApplications";

export class GetExpertApplications implements IGetExpertApplications {
  constructor(private _expertApplicationRepo: IExpertApplicationRepository) {}

  exec = async (
    dto: GetExpertApplicationsDTO,
  ): Promise<GetExpertApplicationsOutputDTO> => {
    const { applications, hasNextPage, nextCursor } =
      await this._expertApplicationRepo.findAll(dto);

    return {
      applications: applications.map(
        (application): ExpertApplicationListItemDTO => ({
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          reviewedByAdminId: application.reviewedByAdminId,
          fullName: application.fullName,
          email: application.email,
          phone: application.phone,
          linkedinUrl: application.linkedinUrl,
          yearsExperience: application.yearsExperience,
          hasTeachingExperience: application.hasTeachingExperience,
          proposedTitle: application.proposedTitle,
        }),
      ),
      hasNextPage,
      nextCursor,
    };
  };
}
