import type { IEventConsumer } from "../application/ports/IEventConsumer";
import type { INotificationService } from "../application/service-interfaces/INotificationService";
import { connectionAcceptedHandler } from "./handlers/connectionAccepted.handler";
import { connectionRejectedHandler } from "./handlers/connectionRejected.handler";
import { connectionRequestedHandler } from "./handlers/connectionRequested.handler";

export function setupEventHandlers(
  eventConsumer: IEventConsumer,
  notificationService: INotificationService,
) {
  eventConsumer.registerHandler(
    "connection.requested",
    connectionRequestedHandler(notificationService),
  );
  eventConsumer.registerHandler(
    "connection.accepted",
    connectionAcceptedHandler(notificationService),
  );
  eventConsumer.registerHandler(
    "connection.rejected",
    connectionRejectedHandler(notificationService),
  );
}
