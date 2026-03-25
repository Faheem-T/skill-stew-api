import { Client } from "@elastic/elasticsearch";
import { Expert } from "../../../domain/entities/Expert";
import { IExpertRepository } from "../../../domain/repositories/IExpertRepository";
import { BaseRepository } from "./BaseRepository";
import { ExpertMapper } from "../../mappers/ExpertMapper";

export interface ExpertDoc {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  yearsExperience: number;
}

export class ExpertRepository
  extends BaseRepository<Expert, ExpertDoc>
  implements IExpertRepository
{
  constructor(es: Client) {
    super("experts", es);
  }

  protected mapper = new ExpertMapper();

  protected getEntityName(): string {
    return "Expert";
  }
}
