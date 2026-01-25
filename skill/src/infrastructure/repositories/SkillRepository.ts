import { Skill } from "../../domain/entities/Skill";
import type { ISkillRepository } from "../../domain/repositories/ISkillRepository";
import {
  type SkillAttr,
  type SkillDoc,
  SkillModel,
} from "../models/skillModel";
import { mapMongooseError } from "../mappers/ErrorMapper";

export class SkillRepository implements ISkillRepository {
  save = async (skill: Skill): Promise<Skill> => {
    try {
      const attrs = this.toPersistence(skill);
      const newSkill = SkillModel.build(attrs);
      const savedSkill = await newSkill.save();
      return this.toDomain(savedSkill);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getById = async (id: string): Promise<Skill | null> => {
    try {
      const doc = await SkillModel.findById(id);
      if (!doc) return null;
      return this.toDomain(doc);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  private toPersistence = (skill: Skill): SkillAttr => {
    const {
      id,
      name,
      normalizedName,
      description,
      alternateNames,
      status,
      category,
    } = skill;

    return {
      _id: id,
      name,
      normalizedName,
      description,
      alternateNames,
      status,
      category,
    };
  };

  private toDomain = (doc: SkillDoc): Skill => {
    const { _id, name, description, alternateNames, status, category } = doc;
    return new Skill({
      id: _id,
      name,
      description,
      alternateNames,
      status,
      category,
    });
  };
}
