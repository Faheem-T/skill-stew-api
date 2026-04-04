import type {
  CohortEnrollmentResponseDTO,
  CohortMemberResponseDTO,
  CohortResponseDTO,
  CohortSummaryResponseDTO,
  CreateCohortDTO,
  GetCohortParamsDTO,
  GetCohortsQueryDTO,
  UpdateCohortBodyDTO,
} from "../dtos/cohort.dto";

export interface ICohortService {
  createCohort(data: CreateCohortDTO): Promise<CohortResponseDTO>;
  getCohorts(data: GetCohortsQueryDTO): Promise<CohortSummaryResponseDTO[]>;
  getCohortById(params: GetCohortParamsDTO): Promise<CohortResponseDTO>;
  updateCohort(
    cohortId: string,
    expertId: string,
    data: UpdateCohortBodyDTO,
  ): Promise<CohortResponseDTO>;
  deleteCohort(cohortId: string, expertId: string): Promise<void>;
  getCohortMembers(
    cohortId: string,
    expertId: string,
  ): Promise<CohortMemberResponseDTO[]>;
  enrollInCohort(
    cohortId: string,
    userId: string,
  ): Promise<CohortEnrollmentResponseDTO>;
}
