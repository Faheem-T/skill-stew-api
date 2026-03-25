export interface IApproveExpertApplication {
  exec(applicationId: string, adminId: string): Promise<boolean>;
}
