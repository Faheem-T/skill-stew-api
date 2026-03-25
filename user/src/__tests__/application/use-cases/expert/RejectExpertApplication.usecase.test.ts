import { describe, expect, it, jest } from "@jest/globals";
import { RejectExpertApplication } from "../../../../application/use-cases/expert-applications/RejectExpertApplication.usecase";
import { ValidationError } from "../../../../application/errors/ValidationError";
import { IUnitOfWork } from "../../../../application/ports/IUnitOfWork";
import { ExpertApplication } from "../../../../domain/entities/ExpertApplication";
import { User } from "../../../../domain/entities/User";
import { IExpertApplicationRepository } from "../../../../domain/repositories/IExpertApplicationRepository";
import { IOutboxEventRepository } from "../../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";

jest.mock("uuid", () => ({
  v7: () => "generated-id",
}));

describe("RejectExpertApplication", () => {
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

    const userRepo = {
      findById: findUserById,
    } as unknown as IUserRepository;

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

    const usecase = new RejectExpertApplication(
      expertApplicationRepo,
      userRepo,
      outboxRepo,
      unitOfWork,
    );

    return {
      usecase,
      findApplicationById,
      updateApplication,
      createOutboxEvent,
      transact,
    };
  };

  it("rejects a pending application and emits an outbox event with the reason", async () => {
    const { usecase, updateApplication, createOutboxEvent, transact } =
      buildUsecase();

    const result = await usecase.exec(
      "app-1",
      "admin-1",
      "We need more workshop evidence.",
    );

    expect(result).toBe(true);
    expect(transact).toHaveBeenCalledTimes(1);
    expect(updateApplication).toHaveBeenCalledWith(
      "app-1",
      expect.objectContaining({
        status: "rejected",
        rejectionReason: "We need more workshop evidence.",
        reviewedByAdminId: "admin-1",
        reviewedAt: expect.any(Date),
      }),
      expect.anything(),
    );
    expect(createOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "expert.application.rejected",
        status: "PENDING",
        payload: {
          expertId: "user-1",
          email: "jane@example.com",
          rejectedAt: expect.any(Date),
          rejectedReason: "We need more workshop evidence.",
        },
      }),
      expect.anything(),
    );
  });

  it("rejects when the application is not pending", async () => {
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
});
