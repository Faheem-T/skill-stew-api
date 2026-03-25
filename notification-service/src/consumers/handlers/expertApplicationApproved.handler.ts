import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import type { IEmailService } from "../../application/ports/IEmailService";

export const expertApplicationApprovedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
    emailService: IEmailService,
  ) =>
  async (event: AppEvent<"expert.application.approved">) => {
    const savedNotification = await notificationService.createNotification({
      recipientId: event.data.expertId,
      type: NotificationType.EXPERT_APPLICATION_APPROVED,
      data: {
        type: NotificationType.EXPERT_APPLICATION_APPROVED,
        approvedAt: event.data.approvedAt,
      },
    });

    realtimeEventPublisher.emitToRecipient(savedNotification);
    await emailService.sendExpertApplicationApprovedMail(event.data.email);

    return { success: true };
  };
