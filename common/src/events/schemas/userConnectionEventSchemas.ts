import z from "zod";

export const connectionRequestedSchema = z
  .object({
    connectionId: z.string(),
    requesterId: z.string(),
    recipientId: z.string(),
    requesterUsername: z.string().optional(),
    recipientUsername: z.string().optional(),
    timestamp: z.coerce.date(),
  })
  .strict();

export const connectionAcceptedSchema = z.object({
  connectionId: z.string(),
  accepterId: z.string(),
  accepterUsername: z.string().optional(),
  timestamp: z.coerce.date(),
});

export const connectionRejectedSchema = z.object({
  connectionId: z.string(),
  rejecterId: z.string(),
  rejecterUsername: z.string().optional(),
  timestamp: z.coerce.date(),
});

export const ConnectionEventSchemas = {
  "connection.requested": connectionRequestedSchema,
  "connection.accepted": connectionAcceptedSchema,
  "connection.rejected": connectionRejectedSchema,
} as const;
