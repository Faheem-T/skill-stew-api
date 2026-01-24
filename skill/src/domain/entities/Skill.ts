import { v7 as uuidv7 } from "uuid";

export const skillStatuses = ["Pending", "Approved", "Rejected"] as const;

type SkillStatus = (typeof skillStatuses)[number];

export class Skill {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  description?: string;
  alternateNames: string[];
  status: SkillStatus;
  category?: string;

  constructor({
    id,
    name,
    description,
    alternateNames = [],
    status = "Pending",
    category,
  }: {
    id?: string;
    name: string;
    description?: string;
    alternateNames?: string[];
    status?: SkillStatus;
    category?: string;
  }) {
    this.id = id ?? uuidv7();
    this.name = name;
    this.alternateNames = alternateNames;
    this.status = status;
    this.category = category;
    this.normalizedName = Skill.normalize(name);
    this.description = description;
  }

  updateName(name: string) {
    (this as any).name = name;
    (this as any).normalizedName = Skill.normalize(name);
  }

  private static normalize(name: string): string {
    return name.trim().toLowerCase();
  }
}
