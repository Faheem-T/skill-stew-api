import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";

export const connectionAcceptedHandler =
  (notificationService: INotificationService) =>
  async (event: AppEvent<"connection.accepted">) => {
    const { connectionId, accepterId, accepterUsername } = event.data;

    await notificationService.createNotification({
      recipientId: event.data.requesterId,
      type: NotificationType.CONNECTION_ACCEPTED,
      data: {
        type: NotificationType.CONNECTION_ACCEPTED,
        accepterId,
        accepterUsername,
        connectionId,
      },
    });

    return { success: true };
  };
