import z from "zod";
import { skillStatuses } from "../../domain/entities/Skill";

export const createSkillDTO = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  description: z.string().optional(),
  alternateNames: z.array(z.string()),
  status: z.enum(skillStatuses),
  category: z.string().optional(),
});

export type CreateSkillDTO = z.infer<typeof createSkillDTO>;

export const skillResponseDTO = createSkillDTO.extend({
  normalizedName: z.string(),
  id: z.string(),
});

export type SkillResponseDTO = z.infer<typeof skillResponseDTO>;
