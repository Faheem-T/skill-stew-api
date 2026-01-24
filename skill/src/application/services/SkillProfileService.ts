import { CreateEvent } from "@skillstew/common";
import type {
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";
import { SkillProfile } from "../../domain/entities/SkillProfile";
import type { ISkillProfileService } from "../interfaces/ISkillProfileService";
import type { IMessageProducer } from "../ports/IMessageProducer";
import type { ISkillProfileRepository } from "../../domain/repositories/ISkillProfileRepository";

export class SkillProfileService implements ISkillProfileService {
  constructor(
    private _skillProfileRepo: ISkillProfileRepository,
    private _messageProducer: IMessageProducer,
  ) {}
  saveProfile = async (
    dto: SaveSkillProfileDTO,
  ): Promise<SkillProfileResponseDTO> => {
    const profile = new SkillProfile(dto.id, dto.offered, dto.wanted);
    const savedProfile = await this._skillProfileRepo.save(profile);
    const event = CreateEvent(
      "skill.profileUpdated",
      {
        userId: savedProfile.id,
        offered: dto.offered.map((skill) => ({
          id: skill.skillId,
          name: skill.skillName,
        })),
        wanted: dto.wanted.map((skill) => ({
          id: skill.skillId,
          name: skill.skillName,
        })),
      },
      "skill-service",
    );
    this._messageProducer.publish(event);
    const { id, wanted, offered, createdAt, updatedAt } = savedProfile;
    return { id, wanted, offered, createdAt, updatedAt };
  };
}
