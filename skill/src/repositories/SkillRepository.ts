import { Skill } from "../entities/Skill";
import { ISkillRepository } from "../interfaces/repository-interfaces/ISkillRepository";
import { SkillAttr, SkillDoc, SkillModel } from "../models/skillModel";

export class SkillRepository implements ISkillRepository {
  save = async (skill: Skill): Promise<Skill> => {
    const attrs = SkillRepository.toPersistence(skill);
    const newSkill = SkillModel.build(attrs);
    const savedSkill = await newSkill.save();
    return SkillRepository.toDomain(savedSkill);
  };

  private static toPersistence = (skill: Skill): SkillAttr => {
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

  private static toDomain = (doc: SkillDoc): Skill => {
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
