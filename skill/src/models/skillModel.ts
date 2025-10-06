import mongoose from "mongoose";

const skillStatuses = ["Pending", "Approved", "Rejected"] as const;

type SkillStatus = (typeof skillStatuses)[number];

export interface SkillAttr {
  _id: string;
  name: string;
  normalizedName: string;
  description?: string;
  alternateNames: string[];
  status: SkillStatus;
  category?: string;
}

export type SkillDoc = SkillAttr & mongoose.Document;

interface SkillModel extends mongoose.Model<SkillDoc> {
  build: (attrs: SkillAttr) => SkillDoc;
}

const skillSchema = new mongoose.Schema<SkillDoc>({
  name: {
    type: String,
    required: true,
  },
  normalizedName: {
    type: String,
    required: true,
  },
  description: String,
  alternateNames: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: skillStatuses,
    default: "Pending",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

skillSchema.statics.build = (attrs: SkillAttr) => {
  return new SkillModel(attrs);
};

export const SkillModel = mongoose.model<SkillDoc, SkillModel>(
  "Skill",
  skillSchema,
);
