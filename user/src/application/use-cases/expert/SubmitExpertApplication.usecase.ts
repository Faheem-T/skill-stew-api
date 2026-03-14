import { v7 as uuidv7 } from "uuid";
import { ExpertApplication } from "../../../domain/entities/ExpertApplication";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import {
  SubmitExpertApplicationDTO,
  SubmitExpertApplicationOutputDTO,
} from "../../dtos/expert/SubmitExpertApplication.dto";
import { ISubmitExpertApplication } from "../../interfaces/expert/ISubmitExpertApplication";

export class SubmitExpertApplication implements ISubmitExpertApplication {
  constructor(private _expertApplicationRepo: IExpertApplicationRepository) {}

  exec = async (
    dto: SubmitExpertApplicationDTO,
  ): Promise<SubmitExpertApplicationOutputDTO> => {
    const now = new Date();

    const application = new ExpertApplication({
      id: uuidv7(),
      expertId: dto.expertId,
      status: "pending",
      submittedAt: now,

      // Identity
      fullName: dto.fullName,
      phone: dto.phone,
      socialLinks: dto.socialLinks,

      // Expertise
      yearsExperience: dto.yearsExperience,
      evidenceLinks: dto.evidenceLinks,
      hasTeachingExperience: dto.hasTeachingExperience,
      teachingExperienceDesc: dto.teachingExperienceDesc,

      // Bio
      bio: dto.bio,

      // Workshop Intent
      proposedTitle: dto.proposedTitle,
      proposedDescription: dto.proposedDescription,
      targetAudience: dto.targetAudience,

      // Technical readiness
      confirmedInternet: dto.confirmedInternet,
      confirmedCamera: dto.confirmedCamera,
      confirmedMicrophone: dto.confirmedMicrophone,

      // Legal
      termsAgreed: dto.termsAgreed,
      termsAgreedAt: now,
    });

    const saved = await this._expertApplicationRepo.create(application);

    return {
      id: saved.id,
      status: saved.status,
      submittedAt: saved.submittedAt,
    };
  };
}
