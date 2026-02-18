import z from "zod";
import { UserEventSchemas } from "./schemas/userEventsSchema";
import { SkillsEventSchemas } from "./schemas/skillsEventSchemas";
import { ConnectionEventSchemas } from "./schemas/userConnectionEventSchemas";

// Union of all app event schemas

export const EventSchemas = {
  ...UserEventSchemas,
  ...SkillsEventSchemas,
  ...ConnectionEventSchemas,
} as const;

// Array of all event names
export const EventName = Object.keys(
  EventSchemas,
) as unknown as readonly (keyof typeof EventSchemas)[];

// Union of all app event names
export type EventName = (typeof EventName)[number];

// Union of all app event payloads
export type EventPayload<T extends EventName> = z.infer<
  (typeof EventSchemas)[T]
>;
