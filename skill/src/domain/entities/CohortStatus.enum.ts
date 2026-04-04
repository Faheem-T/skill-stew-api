export const CohortStatus = [
  "upcoming",
  "active",
  "completed",
] as const;

export type CohortStatus = (typeof CohortStatus)[number];
