import { SkillProfile } from "../../domain/entities/SkillProfile";
import type { ISkillProfileRepository } from "../../domain/repositories/ISkillProfileRepository";
import {
  type SkillProfileAttr,
  type SkillProfileDoc,
  SkillProfileModel,
} from "../models/skillProfileModel";
import { mapMongooseError } from "../mappers/ErrorMapper";
import { NotFoundError } from "../../domain/errors";

export class SkillProfileRepository implements ISkillProfileRepository {
  save = async (profile: SkillProfile): Promise<Required<SkillProfile>> => {
    try {
      const attrs = this.toPersistence(profile);
      const newProfile = SkillProfileModel.build(attrs);
      const savedProfile = await SkillProfileModel.findByIdAndUpdate(
        attrs._id,
        newProfile,
        { upsert: true, new: true },
      );
      return this.toDomain(savedProfile);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getById = async (id: string): Promise<SkillProfile> => {
    try {
      const doc = await SkillProfileModel.findById(id);
      if (!doc) throw new NotFoundError("Skill profile");
      return this.toDomain(doc);
    } catch (error) {
      throw mapMongooseError(error);
    }
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
