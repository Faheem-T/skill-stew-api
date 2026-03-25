import { describe, expect, it, jest } from "@jest/globals";
import { SubmitExpertApplication } from "../../../../application/use-cases/expert-applications/SubmitExpertApplication.usecase";
import { IUnitOfWork } from "../../../../application/ports/IUnitOfWork";
import { IExpertApplicationRepository } from "../../../../domain/repositories/IExpertApplicationRepository";
import { IOutboxEventRepository } from "../../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { User } from "../../../../domain/entities/User";

let uuidCall = 0;
jest.mock("uuid", () => ({
  v7: jest.fn(() => {
    uuidCall += 1;
    return uuidCall % 2 === 1 ? "application-id" : "outbox-id";
  }),
}));

describe("SubmitExpertApplication", () => {
  const dto = {
    expertId: "expert-1",
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
    confirmedInternet: true as const,
    confirmedCamera: true as const,
    confirmedMicrophone: true as const,
    termsAgreed: true as const,
  };

  const applicant = new User(
    "expert-1",
    "expert@example.com",
    "EXPERT_APPLICANT",
    true,
    false,
    true,
    "janeexpert",
  );

  const buildUsecase = ({
    adminRecipientIds = ["admin-1", "admin-2"],
  }: {
    adminRecipientIds?: string[];
  } = {}) => {
    const createApplication = jest
      .fn<IExpertApplicationRepository["create"]>()
      .mockImplementation(async (application) => application);

    const expertApplicationRepo = {
      create: createApplication,
    } as unknown as IExpertApplicationRepository;

    const findUserById = jest
      .fn<IUserRepository["findById"]>()
      .mockResolvedValue(applicant);
    const findAdminUserIds = jest
      .fn<IUserRepository["findAdminUserIds"]>()
      .mockResolvedValue(adminRecipientIds);

    const userRepo = {
      findById: findUserById,
      findAdminUserIds,
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

    const usecase = new SubmitExpertApplication(
      expertApplicationRepo,
      userRepo,
      outboxRepo,
      unitOfWork,
    );

    return {
      usecase,
      createApplication,
      findUserById,
      findAdminUserIds,
      createOutboxEvent,
      transact,
    };
  };

  it("creates the application and writes an outbox event for all admins", async () => {
    const {
      usecase,
      createApplication,
      findUserById,
      findAdminUserIds,
      createOutboxEvent,
      transact,
    } = buildUsecase();

    const result = await usecase.exec(dto);

    expect(result).toEqual({
      id: "application-id",
      status: "pending",
      submittedAt: expect.any(Date),
    });
    expect(transact).toHaveBeenCalledTimes(1);
    expect(createApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "application-id",
        expertId: "expert-1",
        status: "pending",
        fullName: dto.fullName,
      }),
      expect.anything(),
    );
    expect(findUserById).toHaveBeenCalledWith("expert-1", expect.anything());
    expect(findAdminUserIds).toHaveBeenCalledWith(expect.anything());
    expect(createOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "outbox-id",
        name: "expert.application.submitted",
        status: "PENDING",
        payload: {
          applicationId: "application-id",
          expertId: "expert-1",
          expertUsername: "janeexpert",
          expertEmail: "expert@example.com",
          adminRecipientIds: ["admin-1", "admin-2"],
          submittedAt: expect.any(Date),
        },
      }),
      expect.anything(),
    );
  });

  it("skips the outbox event when there are no admins to notify", async () => {
    const { usecase, createOutboxEvent } = buildUsecase({
      adminRecipientIds: [],
    });

    const result = await usecase.exec(dto);

    expect(result.id).toBe("application-id");
    expect(createOutboxEvent).not.toHaveBeenCalled();
  });
});
