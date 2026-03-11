import { ExpertApplication } from "../../domain/entities/ExpertApplication";
import { ExpertApplicationTableType } from "../db/schemas/expertApplicationSchema";
import { Mapper } from "./interfaces/Mapper";

export class ExpertApplicationMapper implements Mapper<
  ExpertApplication,
  ExpertApplicationTableType
> {
  toDomain = (raw: ExpertApplicationTableType): ExpertApplication => {
    return new ExpertApplication({
      id: raw.id,
      status: raw.status,
      submittedAt: raw.submitted_at,
      reviewedAt: raw.reviewed_at ?? undefined,
      reviewedByAdminId: raw.reviewed_by_admin_id ?? undefined,
      rejectionReason: raw.rejection_reason ?? undefined,

      // Identity
      fullName: raw.full_name,
      email: raw.email,
      phone: raw.phone,
      linkedinUrl: raw.linkedin_url,

      // Expertise
      yearsExperience: raw.years_experience,
      evidenceLinks: raw.evidence_links ?? [],
      hasTeachingExperience: raw.has_teaching_experience,
      teachingExperienceDesc: raw.teaching_experience_desc ?? undefined,

      // Bio
      bio: raw.bio,

      // Workshop Intent
      proposedTitle: raw.proposed_title,
      proposedDescription: raw.proposed_description,
      targetAudience: raw.target_audience,

      // Technical readiness
      confirmedInternet: raw.confirmed_internet,
      confirmedCamera: raw.confirmed_camera,
      confirmedMicrophone: raw.confirmed_microphone,

      // Legal
      termsAgreed: raw.terms_agreed,
      termsAgreedAt: raw.terms_agreed_at,
    });
  };

  toPersistence = (entity: ExpertApplication): ExpertApplicationTableType => {
    return {
      id: entity.id,
      status: entity.status,
      submitted_at: entity.submittedAt,
      reviewed_at: entity.reviewedAt ?? null,
      reviewed_by_admin_id: entity.reviewedByAdminId ?? null,
      rejection_reason: entity.rejectionReason ?? null,

      // Identity
      full_name: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      linkedin_url: entity.linkedinUrl,

      // Expertise
      years_experience: entity.yearsExperience,
      evidence_links: entity.evidenceLinks,
      has_teaching_experience: entity.hasTeachingExperience,
      teaching_experience_desc: entity.teachingExperienceDesc ?? null,

      // Bio
      bio: entity.bio,

      // Workshop Intent
      proposed_title: entity.proposedTitle,
      proposed_description: entity.proposedDescription,
      target_audience: entity.targetAudience,

      // Technical readiness
      confirmed_internet: entity.confirmedInternet,
      confirmed_camera: entity.confirmedCamera,
      confirmed_microphone: entity.confirmedMicrophone,

      // Legal
      terms_agreed: entity.termsAgreed,
      terms_agreed_at: entity.termsAgreedAt,
    };
  };

  toPersistencePartial(
    partial: Partial<ExpertApplication>,
  ): Partial<ExpertApplicationTableType> {
    const result: Partial<ExpertApplicationTableType> = {};

    if (partial.id !== undefined) result.id = partial.id;
    if (partial.status !== undefined) result.status = partial.status;
    if (partial.submittedAt !== undefined)
      result.submitted_at = partial.submittedAt;
    if (partial.reviewedAt !== undefined)
      result.reviewed_at = partial.reviewedAt;
    if (partial.reviewedByAdminId !== undefined)
      result.reviewed_by_admin_id = partial.reviewedByAdminId;
    if (partial.rejectionReason !== undefined)
      result.rejection_reason = partial.rejectionReason;

    // Identity
    if (partial.fullName !== undefined) result.full_name = partial.fullName;
    if (partial.email !== undefined) result.email = partial.email;
    if (partial.phone !== undefined) result.phone = partial.phone;
    if (partial.linkedinUrl !== undefined)
      result.linkedin_url = partial.linkedinUrl;

    // Expertise
    if (partial.yearsExperience !== undefined)
      result.years_experience = partial.yearsExperience;
    if (partial.evidenceLinks !== undefined)
      result.evidence_links = partial.evidenceLinks;
    if (partial.hasTeachingExperience !== undefined)
      result.has_teaching_experience = partial.hasTeachingExperience;
    if (partial.teachingExperienceDesc !== undefined)
      result.teaching_experience_desc = partial.teachingExperienceDesc;

    // Bio
    if (partial.bio !== undefined) result.bio = partial.bio;

    // Workshop Intent
    if (partial.proposedTitle !== undefined)
      result.proposed_title = partial.proposedTitle;
    if (partial.proposedDescription !== undefined)
      result.proposed_description = partial.proposedDescription;
    if (partial.targetAudience !== undefined)
      result.target_audience = partial.targetAudience;

    // Technical readiness
    if (partial.confirmedInternet !== undefined)
      result.confirmed_internet = partial.confirmedInternet;
    if (partial.confirmedCamera !== undefined)
      result.confirmed_camera = partial.confirmedCamera;
    if (partial.confirmedMicrophone !== undefined)
      result.confirmed_microphone = partial.confirmedMicrophone;

    // Legal
    if (partial.termsAgreed !== undefined)
      result.terms_agreed = partial.termsAgreed;
    if (partial.termsAgreedAt !== undefined)
      result.terms_agreed_at = partial.termsAgreedAt;

    return result;
  }
}
