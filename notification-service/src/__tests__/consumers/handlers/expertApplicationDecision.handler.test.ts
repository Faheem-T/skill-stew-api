import { describe, expect, it, mock } from "bun:test";
import { expertApplicationApprovedHandler } from "../../../consumers/handlers/expertApplicationApproved.handler";
import { expertApplicationRejectedHandler } from "../../../consumers/handlers/expertApplicationRejected.handler";
import { NotificationType } from "../../../domain/entities/NotificationType.enum";

describe("expert application decision handlers", () => {
  it("creates a realtime notification and sends an approval email", async () => {
    const savedNotification = {
      id: "notif-1",
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_APPROVED,
      title: "Expert Application Approved",
      message: "approved",
      data: {
        type: NotificationType.EXPERT_APPLICATION_APPROVED,
        approvedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
      isRead: false,
      createdAt: new Date("2026-03-24T10:00:00.000Z"),
    };

    const notificationService = {
      createNotification: mock(() => Promise.resolve(savedNotification)),
    };
    const realtimeEventPublisher = {
      emitToRecipient: mock(() => true),
    };
    const emailService = {
      sendExpertApplicationApprovedMail: mock(() => Promise.resolve(true)),
    };

    const handler = expertApplicationApprovedHandler(
      notificationService as any,
      realtimeEventPublisher as any,
      emailService as any,
    );

    await handler({
      data: {
        expertId: "expert-1",
        email: "expert@example.com",
        approvedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    } as any);

    expect(notificationService.createNotification).toHaveBeenCalledWith({
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_APPROVED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_APPROVED,
        approvedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    });
    expect(realtimeEventPublisher.emitToRecipient).toHaveBeenCalledWith(
      savedNotification,
    );
    expect(emailService.sendExpertApplicationApprovedMail).toHaveBeenCalledWith(
      "expert@example.com",
    );
  });

  it("includes the rejection reason when creating a rejection notification and email", async () => {
    const savedNotification = {
      id: "notif-2",
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_REJECTED,
      title: "Expert Application Rejected",
      message: "rejected",
      data: {
        type: NotificationType.EXPERT_APPLICATION_REJECTED,
        rejectedAt: new Date("2026-03-24T10:00:00.000Z"),
        rejectionReason: "Please add stronger portfolio samples.",
      },
      isRead: false,
      createdAt: new Date("2026-03-24T10:00:00.000Z"),
    };

    const notificationService = {
      createNotification: mock(() => Promise.resolve(savedNotification)),
    };
    const realtimeEventPublisher = {
      emitToRecipient: mock(() => true),
    };
    const emailService = {
      sendExpertApplicationRejectedMail: mock(() => Promise.resolve(true)),
    };

    const handler = expertApplicationRejectedHandler(
      notificationService as any,
      realtimeEventPublisher as any,
      emailService as any,
    );

    await handler({
      data: {
        expertId: "expert-1",
        email: "expert@example.com",
        rejectedAt: new Date("2026-03-24T10:00:00.000Z"),
        rejectedReason: "Please add stronger portfolio samples.",
      },
    } as any);

    expect(notificationService.createNotification).toHaveBeenCalledWith({
      recipientId: "expert-1",
      type: NotificationType.EXPERT_APPLICATION_REJECTED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_REJECTED,
        rejectedAt: new Date("2026-03-24T10:00:00.000Z"),
        rejectionReason: "Please add stronger portfolio samples.",
      },
    });
    expect(realtimeEventPublisher.emitToRecipient).toHaveBeenCalledWith(
      savedNotification,
    );
    expect(emailService.sendExpertApplicationRejectedMail).toHaveBeenCalledWith(
      "expert@example.com",
      "Please add stronger portfolio samples.",
    );
  });
});
