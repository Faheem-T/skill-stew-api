import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import type { ILogger } from "../../application/ports/ILogger";

export const connectionRequestedHandler =
  (
    notificationService: INotificationService,
    realtimeEventPublisher: IRealtimeEventPublisher,
    logger: ILogger,
  ) =>
  async (event: AppEvent<"connection.requested">) => {
    const { connectionId, requesterId, requesterUsername, recipientId } =
      event.data;

    logger.info("Handling connection.requested", { event: event });

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

    logger.info("Successfully handled connection.requested");

    return { success: true };
  };
