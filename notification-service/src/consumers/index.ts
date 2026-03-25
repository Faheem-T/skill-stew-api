import type { IEmailService } from "../application/ports/IEmailService";
import type { IEventConsumer } from "../application/ports/IEventConsumer";
import type { ILogger } from "../application/ports/ILogger";
import type { IRealtimeEventPublisher } from "../application/ports/IRealtimeEmitter";
import type { INotificationService } from "../application/service-interfaces/INotificationService";
import { connectionAcceptedHandler } from "./handlers/connectionAccepted.handler";
import { connectionRejectedHandler } from "./handlers/connectionRejected.handler";
import { connectionRequestedHandler } from "./handlers/connectionRequested.handler";
import { expertApplicationApprovedHandler } from "./handlers/expertApplicationApproved.handler";
import { expertApplicationRejectedHandler } from "./handlers/expertApplicationRejected.handler";
import { expertApplicationSubmittedHandler } from "./handlers/expertApplicationSubmitted.handler";
import { expertRegisteredHandler } from "./handlers/expertRegistered.handler";
import { resendVerificationLinkRequestedHandler } from "./handlers/resendVerificationLinkRequested.handler";
import { userRegisteredHandler } from "./handlers/userRegistered.handler";

export async function setupEventHandlers(
  eventConsumer: IEventConsumer,
  notificationService: INotificationService,
  realtimeEventPublisher: IRealtimeEventPublisher,
  logger: ILogger,
  emailService: IEmailService,
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
  await eventConsumer.registerHandler(
    "expert.application.submitted",
    expertApplicationSubmittedHandler(
      notificationService,
      realtimeEventPublisher,
      logger,
    ),
  );
  await eventConsumer.registerHandler(
    "expert.application.approved",
    expertApplicationApprovedHandler(
      notificationService,
      realtimeEventPublisher,
      emailService,
    ),
  );
  await eventConsumer.registerHandler(
    "expert.application.rejected",
    expertApplicationRejectedHandler(
      notificationService,
      realtimeEventPublisher,
      emailService,
    ),
  );
  await eventConsumer.registerHandler(
    "expert.registered",
    expertRegisteredHandler(emailService, logger),
  );
  await eventConsumer.registerHandler(
    "user.registered",
    userRegisteredHandler(emailService, logger),
  );
  await eventConsumer.registerHandler(
    "resendVerificationLink.requested",
    resendVerificationLinkRequestedHandler(emailService, logger),
  );

  logger.info("RabbitMQ event consumer set up successfully");
}
