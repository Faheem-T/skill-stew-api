import "reflect-metadata";
import { container } from "./container";
import { TYPES } from "./constants/Types";
import type { IEventConsumer } from "./application/ports/IEventConsumer";
import type { ILogger } from "./application/ports/ILogger";
import type { INotificationService } from "./application/service-interfaces/INotificationService";
import { setupEventHandlers } from "./consumers";
import type { IRealtimeEventPublisher } from "./application/ports/IRealtimeEmitter";
import { connectDB } from "./infrastructure/config/mongoConnection";

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

await connectDB();

await setupEventHandlers(
  eventConsumer,
  notificationService,
  realtimeEventPublisher,
  logger,
);
