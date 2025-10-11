import mongoose from "mongoose";

const skillProficiencies = [
  "Beginner",
  "Advanced Beginner",
  "Intermediate",
  "Proficient",
  "Expert",
] as const;

type SkillProficiency = (typeof skillProficiencies)[number];

interface OfferedSkill {
  skillId: string;
  proficiency: SkillProficiency;
  hoursTaught: number;
}

interface WantedSkill {
  skillId: string;
  hoursLearned: number;
}

interface SkillProfileAttr {
  _id: string;
  offered: OfferedSkill[];
  wanted: WantedSkill[];
}

type SkillProfileDoc = SkillProfileAttr & mongoose.Document;

interface SkillProfileModel extends mongoose.Model<SkillProfileDoc> {
  build: (attr: SkillProfileAttr) => SkillProfileDoc;
}

const skillProfileSchema = new mongoose.Schema<SkillProfileDoc>({
  _id: String,
  offered: {
    type: [
      {
        skillId: { type: String, required: true },
        proficiency: { type: String, enum: skillProficiencies, required: true },
        hoursTaught: { type: Number, default: 0 },
      },
    ],
  },
  wanted: {
    type: [
      {
        skillId: { type: String, required: true },
        hoursLearned: { type: Number, default: 0 },
      },
    ],
  },
});

skillProfileSchema.statics.build = (attrs: SkillProfileAttr) => {
  return new SkillProfileModel(attrs);
};

export const SkillProfileModel = mongoose.model<
  SkillProfileDoc,
  SkillProfileModel
>("SkillProfile", skillProfileSchema);
