import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";

export const connectionRequestedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
  ) =>
  async (event: AppEvent<"connection.requested">) => {
    const { connectionId, requesterId, requesterUsername, recipientId } =
      event.data;

    const savedNotification = await notificationService.createNotification({
      recipientId,
      type: NotificationType.CONNECTION_REQUEST,
      data: {
        type: NotificationType.CONNECTION_REQUEST,
        connectionId,
        senderId: requesterId,
        senderUsername: requesterUsername,
      },
    });

    realtimeEventPublisher.emitToRecipient(savedNotification);

    return { success: true };
  };
