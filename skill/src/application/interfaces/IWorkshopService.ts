import type {
  CreateWorkshopDTO,
  GetWorkshopsQueryDTO,
  PublishWorkshopParamsDTO,
  ReplaceWorkshopSessionsBodyDTO,
  WorkshopSummaryResponseDTO,
  UpdateWorkshopBodyDTO,
  UpdateWorkshopSessionBodyDTO,
  WorkshopResponseDTO,
  WorkshopSessionResponseDTO,
} from "../dtos/workshop.dto";

export interface IWorkshopService {
  createWorkshop(data: CreateWorkshopDTO): Promise<WorkshopResponseDTO>;
  getWorkshops(data: GetWorkshopsQueryDTO): Promise<WorkshopSummaryResponseDTO[]>;
  getWorkshopById(
    workshopId: string,
    expertId: string,
  ): Promise<WorkshopResponseDTO>;
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
