import { UpsertExpertDTO } from "../dtos/ExpertDTO";
import { IExpertService } from "../interfaces/IExpertService";
import { Expert } from "../../domain/entities/Expert";
import { IExpertRepository } from "../../domain/repositories/IExpertRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ESIndexNotFoundError } from "../errors/infra";

export class ExpertService implements IExpertService {
  constructor(private _expertRepo: IExpertRepository) {}

  upsert = async (dto: UpsertExpertDTO): Promise<void> => {
    const expert = new Expert(dto.id);
    expert.username = dto.username;
    expert.fullName = dto.fullName;
    expert.bio = dto.bio;
    expert.yearsExperience = dto.yearsExperience;

    try {
      await this._expertRepo.findById(dto.id);
      await this._expertRepo.update(dto.id, expert);
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof ESIndexNotFoundError) {
        await this._expertRepo.create(dto.id, expert);
        return;
      }
      throw err;
    }
  };
}
