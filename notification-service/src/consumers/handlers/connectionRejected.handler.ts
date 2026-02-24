import type { AppEvent } from "@skillstew/common";
import type { INotificationService } from "../../application/service-interfaces/INotificationService";
import { NotificationType } from "../../domain/entities/NotificationType.enum";

export const connectionRejectedHandler =
  (notificationService: INotificationService) =>
  async (event: AppEvent<"connection.rejected">) => {
    const { connectionId, rejecterId, rejecterUsername } = event.data;

    await notificationService.createNotification({
      recipientId: event.data.requesterId,
      type: NotificationType.CONNECTION_REJECTED,
      data: {
        type: NotificationType.CONNECTION_REJECTED,
        rejecterId,
        rejecterUsername,
        connectionId,
      },
    });

    return { success: true };
  };
