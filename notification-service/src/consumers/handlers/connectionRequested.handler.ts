import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";

export const connectionRequestedHandler =
  (notificationService: INotificationService) =>
  async (event: AppEvent<"connection.requested">) => {
    const { connectionId, requesterId, requesterUsername, recipientId } =
      event.data;

    await notificationService.createNotification({
      recipientId,
      type: NotificationType.CONNECTION_REQUEST,
      data: {
        type: NotificationType.CONNECTION_REQUEST,
        connectionId,
        senderId: requesterId,
        senderUsername: requesterUsername,
      },
    });

    return { success: true };
  };
