export const MessageQueueErrorCodes = {
  PRODUCER_USED_BEFORE_INITIALIZATION: "Producer used before initialization!",
  CONSUMER_USED_BEFORE_INITIALIZATION: "Consumer used before initialization!",
  UNKNOWN_EVENT: "Unknown event type",
  INVALID_EVENT_PAYLOAD: "Invalid payload",
} as const;
