export const TYPES = {
  NotificationRepository: Symbol.for("NotificationRepository"),
  NotificationService: Symbol.for("NotificationService"),
  NotificationController: Symbol.for("NotificationController"),

  Logger: Symbol.for("Logger"),
  EventConsumer: Symbol.for("EventConsumer"),
  RealtimeEventPublisher: Symbol.for("RealtimeEventPublisher"),
} as const;
