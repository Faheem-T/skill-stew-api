export class ExpertProfile {
  public expertId: string;
  public fullName: string;
  public phone: string;
  public socialLinks: string[];
  public bio: string;

  // Expertise
  public yearsExperience: number;
  public hasTeachingExperience: boolean;
  public teachingExperienceDesc?: string;

  public avatarKey?: string;
  public bannerKey?: string;
  public languages: string[];

  public joinedAt: Date;

  constructor(args: ExpertProfile) {
    this.expertId = args.expertId;
    this.fullName = args.fullName;
    this.phone = args.phone;
    this.socialLinks = args.socialLinks;
    this.bio = args.bio;
    this.yearsExperience = args.yearsExperience;
    this.hasTeachingExperience = args.hasTeachingExperience;
    this.teachingExperienceDesc = args.teachingExperienceDesc;
    this.avatarKey = args.avatarKey;
    this.bannerKey = args.bannerKey;
    this.languages = args.languages;
    this.joinedAt = args.joinedAt;
  }
}
