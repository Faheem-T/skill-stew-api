import { Client } from "@elastic/elasticsearch";
import { Skill } from "../../../domain/entities/Skill";
import { ISkillRepository } from "../../../domain/repositories/ISkillRepository";
import { SkillMapper } from "../../mappers/SkillMapper";
import { BaseRepository } from "./BaseRepository";

export interface SkillDoc {
  id: string;
  name: string;
  alternateNames: string[];
}

export class SkillRepository
  extends BaseRepository<Skill, SkillDoc>
  implements ISkillRepository
{
  constructor(es: Client) {
    super("skills", es);
  }
  protected mapper = new SkillMapper();
}
