import { Resend } from "resend";
import { injectable } from "inversify";
import type { IEmailService } from "../../application/ports/IEmailService";
import { ENV } from "../../utils/dotenv";

@injectable()
export class ResendEmailService implements IEmailService {
  private _client: Resend;
  constructor() {
    this._client = new Resend(ENV.RESEND_API_KEY);
  }
  sendVerificationMail = async (
    email: string,
    verificationLink: string,
  ): Promise<boolean> => {
    try {
      await this._client.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Skill Stew | Verification",
        html: `<a href='${verificationLink}'>Click here to verify your account</a>`,
      });
      return true;
    } catch (err) {
      throw err;
    }
  };
}
