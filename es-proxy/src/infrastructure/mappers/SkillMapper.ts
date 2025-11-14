import { Skill } from "../../domain/entities/Skill";
import { SkillDoc } from "../database/repositories/SkillRepository";
import { Mapper } from "./interfaces/Mapper";

export class SkillMapper implements Mapper<Skill, SkillDoc> {
  constructor() {}

  toDomain(raw: SkillDoc): Skill {
    return raw;
  }

  toPersistence(entity: Skill): SkillDoc {
    return entity;
  }

  toPersistencePartial(partial: Partial<Skill>): Partial<SkillDoc> {
    return partial;
  }
}
