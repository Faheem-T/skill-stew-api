export class ExpertProfile {
  public id: string;
  public expertId: string;
  public fullName: string;
  public phone: string;
  public socialLinks: string[];
  public bio: string;

  // Expertise
  public yearsExperience: number;
  public evidenceLinks: string[];
  public hasTeachingExperience: boolean;
  public teachingExperienceDesc?: string;

  public avatarKey?: string;
  public bannerKey?: string;
  public languages: string[];

  public joinedAt: Date;

  constructor(args: ExpertProfile) {
    this.id = args.id;
    this.expertId = args.expertId;
    this.fullName = args.fullName;
    this.phone = args.phone;
    this.socialLinks = args.socialLinks;
    this.bio = args.bio;
    this.yearsExperience = args.yearsExperience;
    this.evidenceLinks = args.evidenceLinks;
    this.hasTeachingExperience = args.hasTeachingExperience;
    this.teachingExperienceDesc = args.teachingExperienceDesc;
    this.avatarKey = args.avatarKey;
    this.bannerKey = args.bannerKey;
    this.languages = args.languages;
    this.joinedAt = args.joinedAt;
  }
}
