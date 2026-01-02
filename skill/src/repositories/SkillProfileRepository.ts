import { SkillProfile } from "../entities/SkillProfile";
import type { ISkillProfileRepository } from "../interfaces/repository-interfaces/ISkillProfileRepository";
import {
  type SkillProfileAttr,
  type SkillProfileDoc,
  SkillProfileModel,
} from "../models/skillProfileModel";

export class SkillProfileRepository implements ISkillProfileRepository {
  save = async (profile: SkillProfile): Promise<Required<SkillProfile>> => {
    const attrs = this.toPersistence(profile);
    const newProfile = SkillProfileModel.build(attrs);
    const savedProfile = await SkillProfileModel.findByIdAndUpdate(
      attrs._id,
      newProfile,
      { upsert: true, new: true },
    );
    return this.toDomain(savedProfile);
  };

  getById = async (id: string): Promise<SkillProfile | null> => {
    const doc = await SkillProfileModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  };

  private toPersistence = (profile: SkillProfile): SkillProfileAttr => {
    const { id, offered, wanted } = profile;

    return {
      _id: id,
      offered,
      wanted,
    };
  };

  private toDomain = (doc: SkillProfileDoc): Required<SkillProfile> => {
    const { _id, offered, wanted, createdAt, updatedAt } = doc;
    const profile = new SkillProfile(_id, offered, wanted);
    profile.createdAt = createdAt;
    profile.updatedAt = updatedAt;
    return profile as Required<SkillProfile>;
  };
}
