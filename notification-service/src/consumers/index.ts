import type { IEventConsumer } from "../application/ports/IEventConsumer";
import type { ILogger } from "../application/ports/ILogger";
import type { IRealtimeEventPublisher } from "../application/ports/IRealtimeEmitter";
import type { INotificationService } from "../application/service-interfaces/INotificationService";
import { connectionAcceptedHandler } from "./handlers/connectionAccepted.handler";
import { connectionRejectedHandler } from "./handlers/connectionRejected.handler";
import { connectionRequestedHandler } from "./handlers/connectionRequested.handler";

export async function setupEventHandlers(
  eventConsumer: IEventConsumer,
  notificationService: INotificationService,
  realtimeEventPublisher: IRealtimeEventPublisher,
  logger: ILogger,
) {
  await eventConsumer.registerHandler(
    "connection.requested",
    connectionRequestedHandler(
      notificationService,
      realtimeEventPublisher,
      logger,
    ),
  );
  await eventConsumer.registerHandler(
    "connection.accepted",
    connectionAcceptedHandler(notificationService, realtimeEventPublisher),
  );
  await eventConsumer.registerHandler(
    "connection.rejected",
    connectionRejectedHandler(notificationService, realtimeEventPublisher),
  );

  logger.info("RabbitMQ event consumer set up successfully");
}
