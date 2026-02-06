import { Client } from "@elastic/elasticsearch";
import { Skill } from "../../../domain/entities/Skill";
import { ISkillRepository } from "../../../domain/repositories/ISkillRepository";
import { SkillMapper } from "../../mappers/SkillMapper";
import { BaseRepository } from "./BaseRepository";
import { mapESError } from "../../mappers/ErrorMapper";

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

  protected getEntityName(): string {
    return "Skill";
  }

  search = async (query: string): Promise<Skill[]> => {
    try {
      const docs = await this._es.search<SkillDoc>({
        index: this._indexName,
        query: {
          bool: {
            should: [
              {
                match_bool_prefix: {
                  name: query,
                },
              },
              { match_bool_prefix: { alternateNames: query } },
            ],
          },
        },
      });

      return docs.hits.hits
        .map((val) => {
          if (!val._source) return;
          return this.mapper.toDomain(val._source);
        })
        .filter((val) => val !== undefined);
    } catch (err) {
      throw mapESError(err);
    }
  };
}
