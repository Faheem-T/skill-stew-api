import { EventName, EventPayload } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { ValidationError } from "../../errors/ValidationError";
import { ExpertProfile } from "../../../domain/entities/ExpertProfile";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import { IExpertProfileRepository } from "../../../domain/repositories/IExpertProfileRepository";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IApproveExpertApplication } from "../../interfaces/expert-applications/IApproveExpertApplication";
import { IUnitOfWork } from "../../ports/IUnitOfWork";

export class ApproveExpertApplication implements IApproveExpertApplication {
  constructor(
    private _expertApplicationRepo: IExpertApplicationRepository,
    private _userRepo: IUserRepository,
    private _expertProfileRepo: IExpertProfileRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}

  exec = async (applicationId: string, adminId: string): Promise<boolean> => {
    const application =
      await this._expertApplicationRepo.findById(applicationId);

    if (application.status !== "pending") {
      throw new ValidationError([
        {
          field: "applicationId",
          message: "Only pending expert applications can be approved.",
        },
      ]);
    }

    const applicant = await this._userRepo.findById(application.expertId);

    if (applicant.role !== "EXPERT_APPLICANT") {
      throw new ValidationError([
        {
          field: "applicationId",
          message: "Applicant is not in expert applicant state.",
        },
      ]);
    }

    await this._unitOfWork.transact(async (tx) => {
      const reviewedAt = new Date();

      const updatedApplication = await this._expertApplicationRepo.update(
        applicationId,
        {
          status: "approved",
          reviewedAt,
          reviewedByAdminId: adminId,
        },
        tx,
      );

      const updatedApplicant = await this._userRepo.update(
        applicant.id,
        { role: "EXPERT" },
        tx,
      );

      await this._expertProfileRepo.create(
        new ExpertProfile({
          id: uuidv7(),
          expertId: updatedApplicant.id,
          fullName: updatedApplication.fullName,
          phone: updatedApplication.phone,
          socialLinks: updatedApplication.socialLinks,
          bio: updatedApplication.bio,
          yearsExperience: updatedApplication.yearsExperience,
          evidenceLinks: updatedApplication.evidenceLinks,
          hasTeachingExperience: updatedApplication.hasTeachingExperience,
          teachingExperienceDesc: updatedApplication.teachingExperienceDesc,
          avatarKey: undefined,
          bannerKey: undefined,
          languages: [],
          joinedAt: reviewedAt,
        }),
        tx,
      );

      const eventName: EventName = "expert.onboarded";
      const payload: EventPayload<typeof eventName> = {
        expertId: updatedApplicant.id,
        fullName: updatedApplication.fullName,
        bio: updatedApplication.bio,
        socialLinks: updatedApplication.socialLinks,
        username: updatedApplicant.username ?? "",
        yearsExperience: updatedApplication.yearsExperience,
        hasTeachingExperience: updatedApplication.hasTeachingExperience,
        teachingExperienceDesc: updatedApplication.teachingExperienceDesc ?? "",
      };

      const approvalEventName: EventName = "expert.application.approved";
      const approvalPayload: EventPayload<typeof approvalEventName> = {
        expertId: updatedApplicant.id,
        email: updatedApplicant.email,
        approvedAt: reviewedAt,
      };

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: eventName,
          payload,
          status: "PENDING",
          createdAt: reviewedAt,
          processedAt: undefined,
        },
        tx,
      );

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: approvalEventName,
          payload: approvalPayload,
          status: "PENDING",
          createdAt: reviewedAt,
          processedAt: undefined,
        },
        tx,
      );
    });

    return true;
  };
}
