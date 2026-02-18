import z from "zod";

export const connectionRequestedSchema = z
  .object({
    connectionId: z.string(),
    fromUserId: z.string(),
    toUserId: z.string(),
    timestamp: z.coerce.date(),
  })
  .strict();

export const connectionAcceptedSchema = connectionRequestedSchema.extend({});

export const connectionRejectedSchema = connectionRequestedSchema.extend({});

export const ConnectionEventSchemas = {
  "connection.requested": connectionRequestedSchema,
  "connection.accepted": connectionAcceptedSchema,
  "connection.rejected": connectionRejectedSchema,
} as const;
