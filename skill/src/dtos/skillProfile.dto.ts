import z from "zod";
import { skillProficiencies } from "../entities/SkillProfile";

export const saveSkillProfileDTO = z.object({
  id: z.string(),
  offered: z.array(
    z.object({
      skillId: z.string(),
      proficiency: z.enum(skillProficiencies),
      hoursTaught: z.number().optional(),
    }),
  ),
  wanted: z.array(
    z.object({ skillId: z.string(), hoursLearned: z.number().optional() }),
  ),
});

export type SaveSkillProfileDTO = z.infer<typeof saveSkillProfileDTO>;

export const skillProfileResponseDTO = saveSkillProfileDTO.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SkillProfileResponseDTO = z.infer<typeof skillProfileResponseDTO>;
