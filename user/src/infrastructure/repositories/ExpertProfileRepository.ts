import { ExpertProfile } from "../../domain/entities/ExpertProfile";
import { IExpertProfileRepository } from "../../domain/repositories/IExpertProfileRepository";
import { expertProfileTable } from "../db/schemas/expertProfileSchema";
import { ExpertProfileMapper } from "../mappers/ExpertProfileMapper";
import { BaseRepository } from "./BaseRepository";

export class ExpertProfileRepository
  extends BaseRepository<ExpertProfile, typeof expertProfileTable>
  implements IExpertProfileRepository
{
  constructor() {
    super(expertProfileTable);
  }

  protected mapper = new ExpertProfileMapper();
}
