import z from "zod";
import { UserEventSchemas } from "./schemas/userEventsSchema";

// Union of all app event schemas

export const EventSchemas = {
  ...UserEventSchemas,
} as const;

// Union of all app event names
export type EventName = keyof typeof EventSchemas;

// Union of all app event payloads
export type EventPayload<T extends EventName> = z.infer<
  (typeof EventSchemas)[T]
>;
