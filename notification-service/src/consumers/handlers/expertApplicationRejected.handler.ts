import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import type { IEmailService } from "../../application/ports/IEmailService";

export const expertApplicationRejectedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
    emailService: IEmailService,
  ) =>
  async (event: AppEvent<"expert.application.rejected">) => {
    const savedNotification = await notificationService.createNotification({
      recipientId: event.data.expertId,
      type: NotificationType.EXPERT_APPLICATION_REJECTED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_REJECTED,
        rejectedAt: event.data.rejectedAt,
        rejectionReason: event.data.rejectedReason,
      },
    });

    realtimeEventPublisher.emitToRecipient(savedNotification);
    await emailService.sendExpertApplicationRejectedMail(
      event.data.email,
      event.data.rejectedReason,
    );

    return { success: true };
  };
