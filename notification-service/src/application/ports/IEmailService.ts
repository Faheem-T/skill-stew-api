export interface IEmailService {
  sendVerificationMail(
    email: string,
    verificationLink: string,
  ): Promise<boolean>;
}
