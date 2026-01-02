import { Skill } from "../entities/Skill";
import type { ISkillRepository } from "../interfaces/repository-interfaces/ISkillRepository";
import {
  type SkillAttr,
  type SkillDoc,
  SkillModel,
} from "../models/skillModel";

export class SkillRepository implements ISkillRepository {
  save = async (skill: Skill): Promise<Skill> => {
    const attrs = this.toPersistence(skill);
    const newSkill = SkillModel.build(attrs);
    const savedSkill = await newSkill.save();
    return this.toDomain(savedSkill);
  };

  getById = async (id: string): Promise<Skill | null> => {
    const doc = await SkillModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
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
