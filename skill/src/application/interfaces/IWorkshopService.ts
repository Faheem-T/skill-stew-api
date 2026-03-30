import type {
  CreateWorkshopDTO,
  UpdateWorkshopBodyDTO,
  WorkshopResponseDTO,
} from "../dtos/workshop.dto";

export interface IWorkshopService {
  createWorkshop(data: CreateWorkshopDTO): Promise<WorkshopResponseDTO>;
  updateWorkshop(
    workshopId: string,
    expertId: string,
    data: UpdateWorkshopBodyDTO,
  ): Promise<WorkshopResponseDTO>;
}
