import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";

export const connectionAcceptedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
  ) =>
  async (event: AppEvent<"connection.accepted">) => {
    const { connectionId, accepterId, accepterUsername } = event.data;

    const savedNotification = await notificationService.createNotification({
      recipientId: event.data.requesterId,
      type: NotificationType.CONNECTION_ACCEPTED,
      data: {
        type: NotificationType.CONNECTION_ACCEPTED,
        accepterId,
        accepterUsername,
        connectionId,
      },
    });

    realtimeEventPublisher.emitToRecipient(savedNotification);

    return { success: true };
  };
