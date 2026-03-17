import "reflect-metadata";
import { container } from "./container";
import { TYPES } from "./constants/Types";
import type { IEventConsumer } from "./application/ports/IEventConsumer";
import type { ILogger } from "./application/ports/ILogger";
import type { INotificationService } from "./application/service-interfaces/INotificationService";
import { setupEventHandlers } from "./consumers";
import type { IRealtimeEventPublisher } from "./application/ports/IRealtimeEmitter";
import { connectDB } from "./infrastructure/config/mongoConnection";
import { app } from "./http/server";
import { ENV } from "./utils/dotenv";
import type { IEmailService } from "./application/ports/IEmailService";

process.on("uncaughtException", (err, origin) => {
  logger.error(
    "Critical application error. Exiting process with status code 1.",
    { err, origin },
  );
  process.exit(1);
});

const logger = container.get<ILogger>(TYPES.Logger);
const eventConsumer = await container.getAsync<IEventConsumer>(
  TYPES.EventConsumer,
);
const notificationService = container.get<INotificationService>(
  TYPES.NotificationService,
);
const realtimeEventPublisher = container.get<IRealtimeEventPublisher>(
  TYPES.RealtimeEventPublisher,
);
const emailService = container.get<IEmailService>(TYPES.EmailService);

await connectDB();

await setupEventHandlers(
  eventConsumer,
  notificationService,
  realtimeEventPublisher,
  logger,
  emailService,
);

app.listen(ENV.PORT, () => {
  logger.info(`Notification service listening on port ${ENV.PORT}`);
});
