import { ExpertApplicationStatus } from "./ExpertApplicationStatus.enum";

export class ExpertApplication {
  public id: string;
  public status: ExpertApplicationStatus;
  public submittedAt: Date;
  public reviewedAt: Date;
  public reviewedByAdminId: string;
  public rejectionReason: string;

  // Identity
  public fullName: string;
  public email: string;
  public phone: string;
  public linkedinUrl: string;

  // Expertise
  public yearsExperience: number;
  public evidenceLinks: string[];
  public hasTeachingExperience: boolean;
  public teachingExperienceDesc: string;

  // Bio
  public bio: string;

  // Workshop Intent
  public proposedTitle: string;
  public proposedDescription: string;
  public targetAudience: string;

  // Technical readiness
  public confirmedInternet: boolean;
  public confirmedCamera: boolean;
  public confirmedMicrophone: boolean;

  // Legal
  public termsAgreed: boolean;
  public termsAgreedAt: Date;

  constructor(args: ExpertApplication) {
    this.id = args.id;
    this.status = args.status;
    this.submittedAt = args.submittedAt;
    this.reviewedAt = args.reviewedAt;
    this.reviewedByAdminId = args.reviewedByAdminId;
    this.rejectionReason = args.rejectionReason;

    // Identity
    this.fullName = args.fullName;
    this.email = args.email;
    this.phone = args.phone;
    this.linkedinUrl = args.linkedinUrl;

    // Expertise
    this.yearsExperience = args.yearsExperience;
    this.evidenceLinks = args.evidenceLinks;
    this.hasTeachingExperience = args.hasTeachingExperience;
    this.teachingExperienceDesc = args.teachingExperienceDesc;

    // Bio
    this.bio = args.bio;

    // Workshop Intent
    this.proposedTitle = args.proposedTitle;
    this.proposedDescription = args.proposedDescription;
    this.targetAudience = args.targetAudience;

    // Technical readiness
    this.confirmedInternet = args.confirmedInternet;
    this.confirmedCamera = args.confirmedCamera;
    this.confirmedMicrophone = args.confirmedMicrophone;

    // Legal
    this.termsAgreed = args.termsAgreed;
    this.termsAgreedAt = args.termsAgreedAt;
  }
}
