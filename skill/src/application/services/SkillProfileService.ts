import { CreateEvent } from "@skillstew/common";
import type {
  SaveSkillProfileDTO,
  SkillProfileResponseDTO,
} from "../dtos/skillProfile.dto";
import { SkillProfile } from "../../domain/entities/SkillProfile";
import type { ISkillProfileService } from "../interfaces/ISkillProfileService";
import type { IMessageProducer } from "../ports/IMessageProducer";
import type { ISkillProfileRepository } from "../../domain/repositories/ISkillProfileRepository";
import { DuplicateSkillInProfileError } from "../../domain/errors/DuplicateSkillInProfileError";

export class SkillProfileService implements ISkillProfileService {
  constructor(
    private _skillProfileRepo: ISkillProfileRepository,
    private _messageProducer: IMessageProducer,
  ) {}
  saveProfile = async (
    dto: SaveSkillProfileDTO,
  ): Promise<SkillProfileResponseDTO> => {
    try {
      // Check for duplicate skills in offered and wanted arrays
      const offeredSkillIds = dto.offered.map((skill) => skill.skillId);
      const wantedSkillIds = dto.wanted.map((skill) => skill.skillId);

      // Check for duplicates within offered skills
      const duplicateOfferedSkill = offeredSkillIds.find(
        (skillId, index) => offeredSkillIds.indexOf(skillId) !== index,
      );
      if (duplicateOfferedSkill) {
        throw new DuplicateSkillInProfileError(duplicateOfferedSkill);
      }

      // Check for duplicates within wanted skills
      const duplicateWantedSkill = wantedSkillIds.find(
        (skillId, index) => wantedSkillIds.indexOf(skillId) !== index,
      );
      if (duplicateWantedSkill) {
        throw new DuplicateSkillInProfileError(duplicateWantedSkill);
      }

      // Check for same skill in both offered and wanted
      const conflictingSkill = offeredSkillIds.find((skillId) =>
        wantedSkillIds.includes(skillId),
      );
      if (conflictingSkill) {
        throw new DuplicateSkillInProfileError(conflictingSkill);
      }

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
    } catch (error) {
      // Re-throw errors as-is (they're already properly mapped by repository)
      throw error;
    }
  };
}
