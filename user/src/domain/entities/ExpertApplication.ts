import { ExpertApplicationStatus } from "./ExpertApplicationStatus.enum";

export class ExpertApplication {
  public id: string;
  public status: ExpertApplicationStatus;
  public submittedAt: Date;
  public reviewedAt: Date;
  public reviewedByAdminId: string;
  public rejectionReason: string;

  // Identity
  public full_name: string;
  public email: string;
  public phone: string;
  public linkedin_url: string;

  // Expertise
  public years_experience: number;
  public evidence_links: string[];
  public has_teaching_experience: boolean;
  public teaching_experience_desc: string;

  // Bio
  public bio: string;

  // Workshop Intent
  public proposed_title: string;
  public proposed_description: string;
  public target_audience: string;

  // Technical readiness
  public confirmed_internet: boolean;
  public confirmed_camera: boolean;
  public confirmed_microphone: boolean;

  // Legal
  public terms_agreed: boolean;
  public terms_agreed_at: boolean;

  constructor(args: ExpertApplication) {
    this.id = args.id;
    this.status = args.status;
    this.submittedAt = args.submittedAt;
    this.reviewedAt = args.reviewedAt;
    this.reviewedByAdminId = args.reviewedByAdminId;
    this.rejectionReason = args.rejectionReason;

    // Identity
    this.full_name = args.full_name;
    this.email = args.email;
    this.phone = args.phone;
    this.linkedin_url = args.linkedin_url;

    // Expertise
    this.years_experience = args.years_experience;
    this.evidence_links = args.evidence_links;
    this.has_teaching_experience = args.has_teaching_experience;
    this.teaching_experience_desc = args.teaching_experience_desc;

    // Bio
    this.bio = args.bio;

    // Workshop Intent
    this.proposed_title = args.proposed_title;
    this.proposed_description = args.proposed_description;
    this.target_audience = args.target_audience;

    // Technical readiness
    this.confirmed_internet = args.confirmed_internet;
    this.confirmed_camera = args.confirmed_camera;
    this.confirmed_microphone = args.confirmed_microphone;

    // Legal
    this.terms_agreed = args.terms_agreed;
    this.terms_agreed_at = args.terms_agreed_at;
  }
}
