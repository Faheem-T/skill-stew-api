import { AppEvent } from "@skillstew/common";
import { EventName } from "@skillstew/common/build/events/EventMap";

interface HandlerResult {
  success: boolean;
  retryable?: boolean;
}

export interface IConsumer {
  registerHandler: <T extends EventName>(
    eventName: T,
    handler: (event: AppEvent<T>) => Promise<HandlerResult>,
  ) => void;
}
