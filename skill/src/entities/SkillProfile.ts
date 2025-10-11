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
  level: SkillProficiency;
  hoursTaught: number;
}

interface WantedSkill {
  skillId: string;
  hoursLearned: number;
}

export class SkillProfile {
  constructor(
    public id: string,
    public offered: OfferedSkill[],
    public wanted: WantedSkill[],
  ) {}
}
