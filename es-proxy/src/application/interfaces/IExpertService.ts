import { UpsertExpertDTO } from "../dtos/ExpertDTO";

export interface IExpertService {
  upsert(dto: UpsertExpertDTO): Promise<void>;
}
