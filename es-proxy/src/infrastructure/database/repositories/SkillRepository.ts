import { Skill } from "../../../domain/entities/Skill";
import { ISkillRepository } from "../../../domain/repositories/ISkillRepository";
import { Mapper } from "../../mappers/interfaces/Mapper";
import { BaseRepository } from "./BaseRepository";

export class SkillRepository
  extends BaseRepository<Skill, any>
  implements ISkillRepository
{
  protected mapper: Mapper<Skill, any>;
}
