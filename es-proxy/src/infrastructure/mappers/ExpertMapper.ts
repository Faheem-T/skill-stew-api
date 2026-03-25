import { Expert } from "../../domain/entities/Expert";
import { ExpertDoc } from "../database/repositories/ExpertRepository";
import { Mapper } from "./interfaces/Mapper";

export class ExpertMapper implements Mapper<Expert, ExpertDoc> {
  toPersistence(entity: Expert): ExpertDoc {
    return { ...entity };
  }

  toDomain(raw: ExpertDoc): Expert {
    const expert = new Expert(raw.id);
    expert.username = raw.username;
    expert.fullName = raw.fullName;
    expert.bio = raw.bio;
    expert.yearsExperience = raw.yearsExperience;
    return expert;
  }

  toPersistencePartial(partial: Partial<Expert>): Partial<ExpertDoc> {
    return { ...partial };
  }
}
