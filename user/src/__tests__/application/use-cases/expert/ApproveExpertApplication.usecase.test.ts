import { describe, expect, it, jest } from "@jest/globals";
import { ApproveExpertApplication } from "../../../../application/use-cases/expert-applications/ApproveExpertApplication.usecase";
import { ValidationError } from "../../../../application/errors/ValidationError";
import { IUnitOfWork } from "../../../../application/ports/IUnitOfWork";
import { ExpertApplication } from "../../../../domain/entities/ExpertApplication";
import { User } from "../../../../domain/entities/User";
import { IExpertApplicationRepository } from "../../../../domain/repositories/IExpertApplicationRepository";
import { IExpertProfileRepository } from "../../../../domain/repositories/IExpertProfileRepository";
import { IOutboxEventRepository } from "../../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";

jest.mock("uuid", () => ({
  v7: () => "generated-id",
}));

describe("ApproveExpertApplication", () => {
  const application = new ExpertApplication({
    id: "app-1",
    expertId: "user-1",
    status: "pending",
    submittedAt: new Date("2026-03-18T10:00:00.000Z"),
    fullName: "Jane Expert",
    phone: "1234567890",
    socialLinks: ["https://example.com/jane"],
    yearsExperience: 7,
    evidenceLinks: ["https://example.com/proof"],
    hasTeachingExperience: true,
    teachingExperienceDesc: "Runs live cohorts.",
    bio: "Builds practical backend systems.",
    proposedTitle: "Scalable APIs",
    proposedDescription: "A workshop on API design.",
    targetAudience: "Intermediate developers",
    confirmedInternet: true,
    confirmedCamera: true,
    confirmedMicrophone: true,
    termsAgreed: true,
    termsAgreedAt: new Date("2026-03-18T10:00:00.000Z"),
  });

  const applicant = new User(
    "user-1",
    "jane@example.com",
    "EXPERT_APPLICANT",
    true,
    false,
    true,
    "janeexpert",
  );

  const buildUsecase = () => {
    const findApplicationById = jest
      .fn<IExpertApplicationRepository["findById"]>()
      .mockResolvedValue(application);

    const updateApplication = jest
      .fn<IExpertApplicationRepository["update"]>()
      .mockImplementation(async (id, partial) => {
        return new ExpertApplication({
          ...application,
          id,
          ...partial,
        } as ExpertApplication);
      });

    const expertApplicationRepo = {
      findById: findApplicationById,
      update: updateApplication,
    } as unknown as IExpertApplicationRepository;

    const findUserById = jest
      .fn<IUserRepository["findById"]>()
      .mockResolvedValue(applicant);

    const updateUser = jest
      .fn<IUserRepository["update"]>()
      .mockImplementation(async (id, partial) => {
        return new User(
          id,
          applicant.email,
          partial.role ?? applicant.role,
          applicant.isVerified,
          applicant.isBlocked,
          applicant.hasGoogleAuth,
          applicant.username,
          applicant.passwordHash,
          applicant.createdAt,
          applicant.updatedAt,
        );
      });

    const userRepo = {
      findById: findUserById,
      update: updateUser,
    } as unknown as IUserRepository;

    const createExpertProfile = jest
      .fn<IExpertProfileRepository["create"]>()
      .mockImplementation(async (profile) => profile);

    const expertProfileRepo = {
      create: createExpertProfile,
    } as unknown as IExpertProfileRepository;

    const createOutboxEvent = jest
      .fn<IOutboxEventRepository["create"]>()
      .mockResolvedValue();

    const outboxRepo = {
      create: createOutboxEvent,
    } as unknown as IOutboxEventRepository;

    const transact = jest
      .fn<IUnitOfWork["transact"]>()
      .mockImplementation(async (work) => work({} as any));

    const unitOfWork = {
      transact,
    } as IUnitOfWork;

    const usecase = new ApproveExpertApplication(
      expertApplicationRepo,
      userRepo,
      expertProfileRepo,
      outboxRepo,
      unitOfWork,
    );

    return {
      usecase,
      findApplicationById,
      updateApplication,
      findUserById,
      updateUser,
      createExpertProfile,
      createOutboxEvent,
      transact,
    };
  };

  it("approves a pending application, promotes the user, creates a profile, and emits an outbox event", async () => {
    const {
      usecase,
      updateApplication,
      updateUser,
      createExpertProfile,
      createOutboxEvent,
      transact,
    } = buildUsecase();

    const result = await usecase.exec("app-1", "admin-1");

    expect(result).toBe(true);
    expect(transact).toHaveBeenCalledTimes(1);
    expect(updateApplication).toHaveBeenCalledWith(
      "app-1",
      expect.objectContaining({
        status: "approved",
        reviewedByAdminId: "admin-1",
        reviewedAt: expect.any(Date),
      }),
      expect.anything(),
    );
    expect(updateUser).toHaveBeenCalledWith(
      "user-1",
      { role: "EXPERT" },
      expect.anything(),
    );
    expect(createExpertProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        expertId: "user-1",
        fullName: application.fullName,
        phone: application.phone,
        socialLinks: application.socialLinks,
        bio: application.bio,
        yearsExperience: application.yearsExperience,
        evidenceLinks: application.evidenceLinks,
        hasTeachingExperience: application.hasTeachingExperience,
        teachingExperienceDesc: application.teachingExperienceDesc,
        languages: [],
        joinedAt: expect.any(Date),
      }),
      expect.anything(),
    );
    expect(createOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "expert.onboarded",
        status: "PENDING",
        payload: {
          expertId: "user-1",
          fullName: application.fullName,
          bio: application.bio,
          socialLinks: application.socialLinks,
          username: "janeexpert",
          yearsExperience: application.yearsExperience,
          hasTeachingExperience: application.hasTeachingExperience,
          teachingExperienceDesc: application.teachingExperienceDesc,
        },
      }),
      expect.anything(),
    );
  });

  it("rejects approval when the application is not pending", async () => {
    const { usecase, findApplicationById, transact } = buildUsecase();

    findApplicationById.mockResolvedValueOnce(
      new ExpertApplication({
        ...application,
        status: "approved",
      }),
    );

    await expect(usecase.exec("app-1", "admin-1")).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(transact).not.toHaveBeenCalled();
  });

  it("rejects approval when the applicant is not an expert applicant", async () => {
    const { usecase, findUserById, transact } = buildUsecase();

    findUserById.mockResolvedValueOnce(
      new User(
        "user-1",
        "jane@example.com",
        "EXPERT",
        true,
        false,
        true,
        "janeexpert",
      ),
    );

    await expect(usecase.exec("app-1", "admin-1")).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(transact).not.toHaveBeenCalled();
  });
});
