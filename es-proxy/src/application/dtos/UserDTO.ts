import z from "zod";

export const saveUserDTO = z.object({
  id: z.uuid(),
});

export type SaveUserDTO = z.infer<typeof saveUserDTO>;

export const updateUserProfileDTO = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  username: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      formattedAddress: z.string(),
    })
    .optional(),
  languages: z.array(z.string()).optional(),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileDTO>;

export const updateUserSkillProfileDTO = z.object({
  id: z.uuid(),
  offeredSkills: z.array(z.string()),
  wantedSkills: z.array(z.string()),
});

export type UpdateUserSkillProfileDTO = z.infer<
  typeof updateUserSkillProfileDTO
>;
