import type {
  CreateWorkshopDTO,
  PublishWorkshopParamsDTO,
  ReplaceWorkshopSessionsBodyDTO,
  UpdateWorkshopBodyDTO,
  UpdateWorkshopSessionBodyDTO,
  WorkshopResponseDTO,
  WorkshopSessionResponseDTO,
} from "../dtos/workshop.dto";

export interface IWorkshopService {
  createWorkshop(data: CreateWorkshopDTO): Promise<WorkshopResponseDTO>;
  updateWorkshop(
    workshopId: string,
    expertId: string,
    data: UpdateWorkshopBodyDTO,
  ): Promise<WorkshopResponseDTO>;
  replaceWorkshopSessions(
    workshopId: string,
    expertId: string,
    data: ReplaceWorkshopSessionsBodyDTO,
  ): Promise<WorkshopSessionResponseDTO[]>;
  updateWorkshopSession(
    workshopId: string,
    sessionId: string,
    expertId: string,
    data: UpdateWorkshopSessionBodyDTO,
  ): Promise<WorkshopSessionResponseDTO>;
  publishWorkshop(params: PublishWorkshopParamsDTO): Promise<WorkshopResponseDTO>;
}
