export interface IEmailService {
  sendVerificationMail(
    email: string,
    verificationLink: string,
  ): Promise<boolean>;
  sendExpertApplicationApprovedMail(email: string): Promise<boolean>;
  sendExpertApplicationRejectedMail(
    email: string,
    rejectionReason?: string,
  ): Promise<boolean>;
}
