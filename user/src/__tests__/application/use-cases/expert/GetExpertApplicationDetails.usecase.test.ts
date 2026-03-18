import { describe, expect, it, jest } from "@jest/globals";
import { GetExpertApplicationDetails } from "../../../../application/use-cases/expert/GetExpertApplicationDetails.usecase";
import { IExpertApplicationRepository } from "../../../../domain/repositories/IExpertApplicationRepository";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { ExpertApplication } from "../../../../domain/entities/ExpertApplication";
import { User } from "../../../../domain/entities/User";

describe("GetExpertApplicationDetails", () => {
  it("returns the application details with the linked user email", async () => {
    const application = new ExpertApplication({
      id: "app-1",
      expertId: "user-1",
      status: "pending",
      submittedAt: new Date("2026-03-18T10:00:00.000Z"),
      fullName: "Jane Expert",
      phone: "1234567890",
      socialLinks: ["https://example.com"],
      yearsExperience: 5,
      evidenceLinks: ["https://example.com/evidence"],
      hasTeachingExperience: true,
      bio: "Bio",
      proposedTitle: "Workshop",
      proposedDescription: "Description",
      targetAudience: "Beginners",
      confirmedInternet: true,
      confirmedCamera: true,
      confirmedMicrophone: true,
      termsAgreed: true,
      termsAgreedAt: new Date("2026-03-18T10:00:00.000Z"),
    });

    const findById = jest
      .fn<IExpertApplicationRepository["findById"]>()
      .mockResolvedValue(application);

    const findByUserId = jest
      .fn<IUserRepository["findById"]>()
      .mockResolvedValue(
        new User(
          "user-1",
          "jane@example.com",
          "EXPERT_APPLICANT",
          true,
          false,
          true,
        ),
      );

    const usecase = new GetExpertApplicationDetails(
      {
        findById,
      } as unknown as IExpertApplicationRepository,
      {
        findById: findByUserId,
      } as unknown as IUserRepository,
    );

    const result = await usecase.exec({ applicationId: "app-1" });

    expect(findById).toHaveBeenCalledWith("app-1");
    expect(findByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      ...application,
      email: "jane@example.com",
    });
  });
});
