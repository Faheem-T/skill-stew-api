export const TYPES = {
  NotificationRepository: Symbol.for("NotificationRepository"),
  UnreadNotificationCountRepository: Symbol.for(
    "UnreadNotificationCountRepository",
  ),
  NotificationService: Symbol.for("NotificationService"),
  UnreadNotificationCountService: Symbol.for("UnreadNotificationCountService"),
  NotificationController: Symbol.for("NotificationController"),

  Logger: Symbol.for("Logger"),
  EventConsumer: Symbol.for("EventConsumer"),
  RealtimeEventPublisher: Symbol.for("RealtimeEventPublisher"),
  RedisClient: Symbol.for("RedisClient"),
} as const;
