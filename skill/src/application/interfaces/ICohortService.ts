import type {
  CohortEnrollmentResponseDTO,
  CohortMemberResponseDTO,
  CohortResponseDTO,
  CohortSummaryResponseDTO,
  CreateCohortDTO,
  GetCohortParamsDTO,
  GetCohortsQueryDTO,
  PublicCohortParamsDTO,
  PublicCohortResponseDTO,
  PublicWorkshopParamsDTO,
  PublicWorkshopResponseDTO,
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
  getPublicWorkshopById(
    params: PublicWorkshopParamsDTO,
  ): Promise<PublicWorkshopResponseDTO>;
  getPublicCohortById(
    params: PublicCohortParamsDTO,
  ): Promise<PublicCohortResponseDTO>;
  enrollInCohort(
    cohortId: string,
    userId: string,
  ): Promise<CohortEnrollmentResponseDTO>;
  handlePaymentSucceeded(data: {
    membershipId: string;
    paymentId: string;
    userId?: string;
    occurredAt: string;
  }): Promise<void>;
  handlePaymentFailed(data: {
    membershipId: string;
    paymentId: string;
    userId?: string;
    occurredAt: string;
  }): Promise<void>;
  handlePaymentRefunded(data: {
    membershipId: string;
    paymentId: string;
    userId?: string;
    occurredAt: string;
  }): Promise<void>;
}
