import z from "zod";
import { ExpertApplicationStatus } from "../../../domain/entities/ExpertApplicationStatus.enum";

export const getExpertApplicationsSchema = z.object({
  limit: z.number().min(1),
  cursor: z.string().optional(),
  filters: z
    .object({
      status: z.enum(ExpertApplicationStatus).optional(),
    })
    .optional(),
});

export type GetExpertApplicationsDTO = z.infer<
  typeof getExpertApplicationsSchema
>;

export type ExpertApplicationListItemDTO = {
  id: string;
  expertId: string;
  status: ExpertApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;

  fullName: string;
  phone: string;
  socialLinks: string[];

  yearsExperience: number;
  hasTeachingExperience: boolean;
  proposedTitle: string;
};

export type GetExpertApplicationsOutputDTO = {
  applications: ExpertApplicationListItemDTO[];
  hasNextPage: boolean;
  nextCursor: string | undefined;
};
