import { EventName, EventPayload } from "./EventMap";

export interface AppEvent<T extends EventName> {
  eventId: string;
  eventName: T;
  timestamp: string; // ISO format
  producer: string; // the service that emitted this event
  data: EventPayload<T>;
  traceId?: string;
}

export type AnyAppEvent = AppEvent<EventName>;
