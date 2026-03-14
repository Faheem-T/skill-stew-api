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
          expertId: application.expertId,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          reviewedByAdminId: application.reviewedByAdminId,
          fullName: application.fullName,
          phone: application.phone,
          yearsExperience: application.yearsExperience,
          hasTeachingExperience: application.hasTeachingExperience,
          proposedTitle: application.proposedTitle,
          socialLinks: application.socialLinks,
        }),
      ),
      hasNextPage,
      nextCursor,
    };
  };
}
