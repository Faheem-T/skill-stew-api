import {
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";
import { SkillProfile } from "../entities/SkillProfile";
import { ISkillProfileRepository } from "../interfaces/repository-interfaces/ISkillProfileRepository";
import { ISkillProfileService } from "../interfaces/service-interfaces/ISkillProfileService";

export class SkillProfileService implements ISkillProfileService {
  constructor(private _skillProfileRepo: ISkillProfileRepository) {}
  saveProfile = async (
    dto: SaveSkillProfileDTO,
  ): Promise<SkillProfileResponseDTO> => {
    const profile = new SkillProfile(dto.id, dto.offered, dto.wanted);
    const savedProfile = await this._skillProfileRepo.save(profile);
    const { id, wanted, offered, createdAt, updatedAt } = savedProfile;
    return { id, wanted, offered, createdAt, updatedAt };
  };
}
