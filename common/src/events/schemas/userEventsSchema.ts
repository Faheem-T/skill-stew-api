import z from "zod";

export const userRegisteredSchema = z.object({
  id: z.uuid(),
  email: z.email(),
});

export const userVerifiedSchema = z.object({
  id: z.uuid(),
});

export const UserEventSchemas = {
  "user.registered": userRegisteredSchema,
  "user.verified": userVerifiedSchema,
} as const;
