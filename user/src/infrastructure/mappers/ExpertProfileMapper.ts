import { ExpertProfile } from "../../domain/entities/ExpertProfile";
import { ExpertProfileTableType } from "../db/schemas/expertProfileSchema";
import { Mapper } from "./interfaces/Mapper";

export class ExpertProfileMapper implements Mapper<
  ExpertProfile,
  ExpertProfileTableType
> {
  toDomain(raw: ExpertProfileTableType): ExpertProfile {
    const {
      id,
      expert_id,
      full_name,
      phone,
      social_links,
      bio,
      years_experience,
      evidence_links,
      has_teaching_experience,
      teaching_experience_desc,
      avatar_key,
      banner_key,
      languages,
      joined_at,
    } = raw;

    return new ExpertProfile({
      id,
      expertId: expert_id,
      fullName: full_name,
      phone,
      socialLinks: social_links,
      bio,
      yearsExperience: years_experience,
      evidenceLinks: evidence_links,
      hasTeachingExperience: has_teaching_experience,
      teachingExperienceDesc: teaching_experience_desc ?? undefined,
      avatarKey: avatar_key ?? undefined,
      bannerKey: banner_key ?? undefined,
      languages: languages ?? [],
      joinedAt: joined_at,
    });
  }

  toPersistence(entity: ExpertProfile): ExpertProfileTableType {
    const {
      id,
      expertId,
      fullName,
      phone,
      socialLinks,
      bio,
      yearsExperience,
      evidenceLinks,
      hasTeachingExperience,
      teachingExperienceDesc = null,
      avatarKey = null,
      bannerKey = null,
      languages = [],
      joinedAt = new Date(),
    } = entity;

    return {
      id,
      expert_id: expertId,
      full_name: fullName,
      phone,
      social_links: socialLinks,
      bio,
      years_experience: yearsExperience,
      evidence_links: evidenceLinks,
      has_teaching_experience: hasTeachingExperience,
      teaching_experience_desc: teachingExperienceDesc,
      avatar_key: avatarKey,
      banner_key: bannerKey,
      languages,
      joined_at: joinedAt,
    };
  }

  toPersistencePartial(
    partial: Partial<ExpertProfile>,
  ): Partial<ExpertProfileTableType> {
    const {
      id,
      expertId,
      fullName,
      phone,
      socialLinks,
      bio,
      yearsExperience,
      evidenceLinks,
      hasTeachingExperience,
      teachingExperienceDesc,
      avatarKey,
      bannerKey,
      languages,
      joinedAt,
    } = partial;

    const result: Partial<ExpertProfileTableType> = {};
    if (id !== undefined) result.id = id;
    if (expertId !== undefined) result.expert_id = expertId;
    if (fullName !== undefined) result.full_name = fullName;
    if (phone !== undefined) result.phone = phone;
    if (socialLinks !== undefined) result.social_links = socialLinks;
    if (bio !== undefined) result.bio = bio;
    if (yearsExperience !== undefined)
      result.years_experience = yearsExperience;
    if (evidenceLinks !== undefined) result.evidence_links = evidenceLinks;
    if (hasTeachingExperience !== undefined)
      result.has_teaching_experience = hasTeachingExperience;
    if (teachingExperienceDesc !== undefined)
      result.teaching_experience_desc = teachingExperienceDesc;
    if (avatarKey !== undefined) result.avatar_key = avatarKey;
    if (bannerKey !== undefined) result.banner_key = bannerKey;
    if (languages !== undefined) result.languages = languages;
    if (joinedAt !== undefined) result.joined_at = joinedAt;

    return result;
  }
}
