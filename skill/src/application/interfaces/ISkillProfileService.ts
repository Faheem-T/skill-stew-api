import type {
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";

export interface ISkillProfileService {
  saveProfile(dto: SaveSkillProfileDTO): Promise<SkillProfileResponseDTO>;
}
