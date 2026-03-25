import { EventName, EventPayload } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { ExpertApplication } from "../../../domain/entities/ExpertApplication";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import {
  SubmitExpertApplicationDTO,
  SubmitExpertApplicationOutputDTO,
} from "../../dtos/expert/SubmitExpertApplication.dto";
import { ISubmitExpertApplication } from "../../interfaces/expert-applications/ISubmitExpertApplication";
import { IUnitOfWork } from "../../ports/IUnitOfWork";

export class SubmitExpertApplication implements ISubmitExpertApplication {
  constructor(
    private _expertApplicationRepo: IExpertApplicationRepository,
    private _userRepo: IUserRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (
    dto: SubmitExpertApplicationDTO,
  ): Promise<SubmitExpertApplicationOutputDTO> => {
    const now = new Date();
    const applicationId = uuidv7();

    const saved = await this._unitOfWork.transact(async (tx) => {
      const application = new ExpertApplication({
        id: applicationId,
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

      const savedApplication = await this._expertApplicationRepo.create(
        application,
        tx,
      );

      const [expert, adminRecipientIds] = await Promise.all([
        this._userRepo.findById(dto.expertId, tx),
        this._userRepo.findAdminUserIds(tx),
      ]);

      if (adminRecipientIds.length > 0) {
        const eventName: EventName = "expert.application.submitted";
        const payload: EventPayload<typeof eventName> = {
          applicationId: savedApplication.id,
          expertId: savedApplication.expertId,
          expertUsername: expert.username,
          expertEmail: expert.email,
          adminRecipientIds,
          submittedAt: savedApplication.submittedAt,
        };

        await this._outboxRepo.create(
          {
            id: uuidv7(),
            name: eventName,
            payload,
            status: "PENDING",
            createdAt: now,
            processedAt: undefined,
          },
          tx,
        );
      }

      return savedApplication;
    });

    return {
      id: saved.id,
      status: saved.status,
      submittedAt: saved.submittedAt,
    };
  };
}
