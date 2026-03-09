import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";

export const connectionRejectedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
  ) =>
  async (event: AppEvent<"connection.rejected">) => {
    const { connectionId, rejecterId, rejecterUsername } = event.data;

    const savedNotification = await notificationService.createNotification({
      recipientId: event.data.requesterId,
      type: NotificationType.CONNECTION_REJECTED,
      data: {
        type: NotificationType.CONNECTION_REJECTED,
        rejecterId,
        rejecterUsername,
        connectionId,
      },
    });

    realtimeEventPublisher.emitToRecipient(savedNotification);

    return { success: true };
  };
