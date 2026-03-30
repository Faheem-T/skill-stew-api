import type {
  CreateWorkshopDTO,
  WorkshopResponseDTO,
} from "../dtos/workshop.dto";

export interface IWorkshopService {
  createWorkshop(data: CreateWorkshopDTO): Promise<WorkshopResponseDTO>;
}
