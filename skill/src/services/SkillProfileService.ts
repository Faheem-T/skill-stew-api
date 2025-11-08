import { CreateEvent } from "@skillstew/common";
import {
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";
import { SkillProfile } from "../entities/SkillProfile";
import { ISkillProfileRepository } from "../interfaces/repository-interfaces/ISkillProfileRepository";
import { ISkillProfileService } from "../interfaces/service-interfaces/ISkillProfileService";
import { IMessageProducer } from "../ports/IMessageProducer";

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
        offered: savedProfile.offered.map((skill) => skill.skillId),
        wanted: savedProfile.wanted.map((skill) => skill.skillId),
      },
      "skill",
    );
    this._messageProducer.publish(event);
    const { id, wanted, offered, createdAt, updatedAt } = savedProfile;
    return { id, wanted, offered, createdAt, updatedAt };
  };
}
