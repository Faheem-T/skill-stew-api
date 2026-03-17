export const TYPES = {
  // repositories
  NotificationRepository: Symbol.for("NotificationRepository"),
  UnreadNotificationCountRepository: Symbol.for(
    "UnreadNotificationCountRepository",
  ),

  // services
  NotificationService: Symbol.for("NotificationService"),
  UnreadNotificationCountService: Symbol.for("UnreadNotificationCountService"),

  // controllers
  NotificationController: Symbol.for("NotificationController"),

  // adapters
  Logger: Symbol.for("Logger"),
  EventConsumer: Symbol.for("EventConsumer"),
  RealtimeEventPublisher: Symbol.for("RealtimeEventPublisher"),
  RedisClient: Symbol.for("RedisClient"),
  UnreadNotificationCountCache: Symbol.for("UnreadNotificationCountCache"),
  UnitOfWork: Symbol.for("UnitOfWork"),
  EmailService: Symbol.for("EmailService"),
} as const;
