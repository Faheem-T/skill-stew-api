import { SkillProfile } from "../entities/SkillProfile";
import { ISkillProfileRepository } from "../interfaces/repository-interfaces/ISkillProfileRepository";
import {
  SkillProfileAttr,
  SkillProfileDoc,
  SkillProfileModel,
} from "../models/skillProfileModel";

export class SkillProfileRepository implements ISkillProfileRepository {
  save = async (profile: SkillProfile): Promise<SkillProfile> => {
    const attrs = this.toPersistence(profile);
    const newProfile = SkillProfileModel.build(attrs);
    const savedProfile = await newProfile.save();
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

  private toDomain = (doc: SkillProfileDoc): SkillProfile => {
    const { _id, offered, wanted } = doc;
    return new SkillProfile(_id, offered, wanted);
  };
}
