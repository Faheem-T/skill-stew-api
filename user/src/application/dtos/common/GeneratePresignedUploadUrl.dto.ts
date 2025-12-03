import z from "zod";
import { USER_ROLES } from "../../../domain/entities/UserRoles";

export const generatePresignedUploadUrlSchema = z.object({
  userId: z.string().nonempty(),
  userRole: z.enum(USER_ROLES),
  type: z.enum(["avatar", "banner"]),
  mimetype: z.enum(["image/png", "image/jpeg", "image/webp"]),
});

export type GeneratePresignedUploadUrlDTO = z.infer<
  typeof generatePresignedUploadUrlSchema
>;
