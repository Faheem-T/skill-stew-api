export const WorkshopStatus = ["draft", "published", "archived"] as const;
export type WorkshopStatus = (typeof WorkshopStatus)[number];
