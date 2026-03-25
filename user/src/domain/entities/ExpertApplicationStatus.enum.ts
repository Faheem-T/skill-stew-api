export const ExpertApplicationStatus = [
  "pending",
  "approved",
  "rejected",
] as const;
export type ExpertApplicationStatus = (typeof ExpertApplicationStatus)[number];
