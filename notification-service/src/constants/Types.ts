export const TYPES = {
  NotificationRepository: Symbol.for("NotificationRepository"),
  NotificationService: Symbol.for("NotificationService"),

  Logger: Symbol.for("Logger"),
  EventConsumer: Symbol.for("EventConsumer"),
} as const;
