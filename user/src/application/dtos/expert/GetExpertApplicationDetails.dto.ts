import z from "zod";
import { ExpertApplication } from "../../../domain/entities/ExpertApplication";

export const getExpertApplicationDetailsSchema = z.object({
  applicationId: z.string(),
});

export type GetExpertApplicationDetailsDTO = z.infer<
  typeof getExpertApplicationDetailsSchema
>;

export type GetExpertApplicationDetailsOutputDTO = ExpertApplication & {
  email: string;
};
