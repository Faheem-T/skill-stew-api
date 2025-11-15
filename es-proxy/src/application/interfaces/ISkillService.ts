import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/SkillDTO";

export interface ISkillService {
  create(dto: CreateSkillDTO): Promise<void>;
  update(dto: UpdateSkillDTO): Promise<void>;
  delete(id: string): Promise<void>;
}
