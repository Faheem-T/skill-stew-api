import { describe, expect, it, mock } from "bun:test";
import { NotificationService } from "../../../application/services/NotificationService";
import { NotificationType } from "../../../domain/entities/NotificationType.enum";

describe("NotificationService", () => {
  it("builds admin expert application submission notification content", async () => {
    const service = new NotificationService(
      {
        create: mock((_notification) =>
          Promise.resolve({
            id: "notif-0",
            recipientId: "admin-1",
            type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
            title: "New Expert Application",
            message: "janeexpert submitted a new expert application.",
            data: {
              type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
              applicationId: "app-1",
              expertId: "expert-1",
              expertUsername: "janeexpert",
              submittedAt: new Date("2026-03-24T10:00:00.000Z"),
            },
            isRead: false,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
          }),
        ),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        transact: mock((work: (tx: unknown) => Promise<unknown>) => work({})),
      } as any,
    );

    const result = await service.createNotification({
      recipientId: "admin-1",
      type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
        applicationId: "app-1",
        expertId: "expert-1",
        expertUsername: "janeexpert",
        submittedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    });

    expect(result.title).toBe("New Expert Application");
    expect(result.message).toBe("janeexpert submitted a new expert application.");
  });

  it("builds approval notification content", async () => {
    const service = new NotificationService(
      {
        create: mock((_notification) =>
          Promise.resolve({
            id: "notif-1",
            recipientId: "expert-1",
            type: NotificationType.EXPERT_APPLICATION_APPROVED,
            title: "Expert Application Approved",
            message:
              "Your expert application has been approved. You can now continue as an expert on Skill Stew.",
            data: {
              type: NotificationType.EXPERT_APPLICATION_APPROVED,
              approvedAt: new Date("2026-03-24T10:00:00.000Z"),
            },
            isRead: false,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
          }),
        ),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        transact: mock((work: (tx: unknown) => Promise<unknown>) => work({})),
      } as any,
    );

    const result = await service.createNotification({
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_APPROVED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_APPROVED,
        approvedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    });

    expect(result.title).toBe("Expert Application Approved");
    expect(result.message).toBe(
      "Your expert application has been approved. You can now continue as an expert on Skill Stew.",
    );
  });

  it("builds rejection notification content with the rejection reason", async () => {
    const service = new NotificationService(
      {
        create: mock((_notification) =>
          Promise.resolve({
            id: "notif-2",
            recipientId: "expert-1",
            type: NotificationType.EXPERT_APPLICATION_REJECTED,
            title: "Expert Application Rejected",
            message:
              "Your expert application was rejected. Reason: Please add stronger portfolio samples.",
            data: {
              type: NotificationType.EXPERT_APPLICATION_REJECTED,
              rejectedAt: new Date("2026-03-24T10:00:00.000Z"),
              rejectionReason: "Please add stronger portfolio samples.",
            },
            isRead: false,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
          }),
        ),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        incrementByUserId: mock(() => Promise.resolve()),
      } as any,
      {
        transact: mock((work: (tx: unknown) => Promise<unknown>) => work({})),
      } as any,
    );

    const result = await service.createNotification({
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_REJECTED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_REJECTED,
        rejectedAt: new Date("2026-03-24T10:00:00.000Z"),
        rejectionReason: "Please add stronger portfolio samples.",
      },
    });

    expect(result.title).toBe("Expert Application Rejected");
    expect(result.message).toBe(
      "Your expert application was rejected. Reason: Please add stronger portfolio samples.",
    );
  });
});
