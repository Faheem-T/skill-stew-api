import z from "zod";

export const saveUserDTO = z.object({
  id: z.string(),
});

export type SaveUserDTO = z.infer<typeof saveUserDTO>;

export const updateUserProfileDTO = z.object({
  id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  location: z
    .object({ latitude: z.number(), longitude: z.number() })
    .optional(),
  languages: z.array(z.string()),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileDTO>;
