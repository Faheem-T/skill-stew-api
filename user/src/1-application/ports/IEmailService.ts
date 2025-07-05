export interface IEmailService {
  sendVerificationLinkToEmail(
    email: string,
    jwt: string,
  ): Promise<void | never>;
}
