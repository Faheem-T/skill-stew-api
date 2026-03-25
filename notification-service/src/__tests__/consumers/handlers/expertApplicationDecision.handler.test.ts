import { describe, expect, it, mock } from "bun:test";
import { expertApplicationApprovedHandler } from "../../../consumers/handlers/expertApplicationApproved.handler";
import { expertApplicationRejectedHandler } from "../../../consumers/handlers/expertApplicationRejected.handler";
import { expertApplicationSubmittedHandler } from "../../../consumers/handlers/expertApplicationSubmitted.handler";
import { NotificationType } from "../../../domain/entities/NotificationType.enum";

describe("expert application decision handlers", () => {
  it("creates notifications for each admin when an expert application is submitted", async () => {
    const savedNotifications = [
      {
        id: "notif-1",
        recipientId: "admin-1",
        type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
        title: "New Expert Application",
        message: "submitted",
        data: {
          type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
          applicationId: "app-1",
          expertId: "expert-1",
          expertUsername: "janeexpert",
          submittedAt: new Date("2026-03-24T10:00:00.000Z"),
        },
        isRead: false,
        createdAt: new Date("2026-03-24T10:00:00.000Z"),
      },
      {
        id: "notif-2",
        recipientId: "admin-2",
        type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
        title: "New Expert Application",
        message: "submitted",
        data: {
          type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
          applicationId: "app-1",
          expertId: "expert-1",
          expertUsername: "janeexpert",
          submittedAt: new Date("2026-03-24T10:00:00.000Z"),
        },
        isRead: false,
        createdAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    ];

    const notificationService = {
      createNotification: mock(() =>
        Promise.resolve(savedNotifications.shift()!),
      ),
    };
    const realtimeEventPublisher = {
      emitToRecipient: mock(() => true),
    };
    const logger = {
      info: mock(() => true),
    };

    const handler = expertApplicationSubmittedHandler(
      notificationService as any,
      realtimeEventPublisher as any,
      logger as any,
    );

    await handler({
      data: {
        applicationId: "app-1",
        expertId: "expert-1",
        expertUsername: "janeexpert",
        expertEmail: "expert@example.com",
        adminRecipientIds: ["admin-1", "admin-2"],
        submittedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    } as any);

    expect(notificationService.createNotification).toHaveBeenNthCalledWith(1, {
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
    expect(notificationService.createNotification).toHaveBeenNthCalledWith(2, {
      recipientId: "admin-2",
      type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
        applicationId: "app-1",
        expertId: "expert-1",
        expertUsername: "janeexpert",
        submittedAt: new Date("2026-03-24T10:00:00.000Z"),
      },
    });
    expect(realtimeEventPublisher.emitToRecipient).toHaveBeenCalledTimes(2);
  });

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
