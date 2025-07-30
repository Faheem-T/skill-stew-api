import { AppEvent } from "./AppEvent";
import { EventName, EventPayload } from "./EventMap";
import { randomUUID } from "crypto";

export function CreateEvent<T extends EventName>(
  eventName: T,
  data: EventPayload<T>,
  producer: string,
  traceId?: string,
): AppEvent<T> {
  return {
    eventName,
    eventId: randomUUID(),
    data,
    producer,
    timestamp: new Date().toISOString(),
    traceId,
  };
}
