import { CreateEvent } from "@skillstew/common";
import type { CreateSkillDTO, SkillResponseDTO } from "../dtos/skill.dto";
import { Skill } from "../../domain/entities/Skill";
import type { ISkillService } from "../interfaces/ISkillService";
import type { ISkillRepository } from "../../domain/repositories/ISkillRepository";
import type { IMessageProducer } from "../ports/IMessageProducer";
import { AlreadyExistsError } from "../../domain/errors/AlreadyExistsError";
import { AppError } from "../errors/AppError.abstract";
import { AppErrorCodes } from "../errors/AppErrorCodes";

export class SkillService implements ISkillService {
  constructor(
    private _skillRepo: ISkillRepository,
    private messageProducer: IMessageProducer,
  ) {}

  createSkill = async ({
    name,
    alternateNames,
    description,
    status,
    category,
  }: CreateSkillDTO): Promise<SkillResponseDTO> => {
    try {
      const skill = new Skill({
        name,
        alternateNames,
        description,
        status,
        category,
      });
      const savedSkill = await this._skillRepo.save(skill);
      const event = CreateEvent("skill.created", { ...savedSkill }, "skill");
      this.messageProducer.publish(event);
      return {
        id: savedSkill.id,
        name: savedSkill.name,
        normalizedName: savedSkill.normalizedName,
        description: savedSkill.description,
        category: savedSkill.category,
        alternateNames: savedSkill.alternateNames,
        status: savedSkill.status,
      };
    } catch (error) {
      // Handle duplicate key errors from ErrorMapper
      if (
        error instanceof AppError &&
        error.code === AppErrorCodes.DB_UNIQUE_CONSTRAINT
      ) {
        throw new AlreadyExistsError(`Skill '${name}'`);
      }

      // Re-throw other errors as-is (they're already properly mapped by repository)
      throw error;
    }
  };

  getSkillById = async (id: string): Promise<SkillResponseDTO> => {
    const skill = await this._skillRepo.getById(id);

    return {
      id: skill.id,
      name: skill.name,
      normalizedName: skill.normalizedName,
      description: skill.description,
      category: skill.category,
      alternateNames: skill.alternateNames,
      status: skill.status,
    };
  };
}
