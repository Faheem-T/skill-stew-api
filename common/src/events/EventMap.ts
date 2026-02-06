import z from "zod";
import { UserEventSchemas } from "./schemas/userEventsSchema";
import { SkillsEventSchemas } from "./schemas/skillsEventSchemas";

// Union of all app event schemas

export const EventSchemas = {
  ...UserEventSchemas,
  ...SkillsEventSchemas,
} as const;

// Union of all app event names
export type EventName = keyof typeof EventSchemas;

// Union of all app event payloads
export type EventPayload<T extends EventName> = z.infer<
  (typeof EventSchemas)[T]
>;
