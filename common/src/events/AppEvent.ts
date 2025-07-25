import { EventName, EventPayload } from "./EventMap";

export interface AppEvent<T extends EventName> {
  eventId: string;
  eventName: T;
  timestamp: string; // ISO format
  producer: string; // the service that emitted this event
  data: EventPayload<T>;
  traceId?: string;
}

export type UserRegisteredEvent = AppEvent<"user.registered">;
export type UserVerifiedEvent = AppEvent<"user.verified">;

export type AnyAppEvent = AppEvent<EventName>;
