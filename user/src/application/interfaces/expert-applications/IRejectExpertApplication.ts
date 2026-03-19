export interface IRejectExpertApplication {
  exec(
    applicationId: string,
    adminId: string,
    rejectionReason?: string,
  ): Promise<boolean>;
}
