import type {
  GetSkillProfileResponseDTO,
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";

export interface ISkillProfileService {
  saveProfile(dto: SaveSkillProfileDTO): Promise<SkillProfileResponseDTO>;
  getProfile(userId: string): Promise<GetSkillProfileResponseDTO>;
}
