import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import type { ILogger } from "../../application/ports/ILogger";

export const expertApplicationSubmittedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
    logger: ILogger,
  ) =>
  async (event: AppEvent<"expert.application.submitted">) => {
    logger.info("Handling expert.application.submitted", { event });

    await Promise.all(
      event.data.adminRecipientIds.map(async (recipientId) => {
        const savedNotification = await notificationService.createNotification({
          recipientId,
          type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
          data: {
            type: NotificationType.EXPERT_APPLICATION_SUBMITTED,
            applicationId: event.data.applicationId,
            expertId: event.data.expertId,
            expertUsername: event.data.expertUsername,
            submittedAt: event.data.submittedAt,
          },
        });

        realtimeEventPublisher.emitToRecipient(savedNotification);
      }),
    );

    logger.info("Successfully handled expert.application.submitted", {
      applicationId: event.data.applicationId,
      recipientCount: event.data.adminRecipientIds.length,
    });

    return { success: true };
  };
