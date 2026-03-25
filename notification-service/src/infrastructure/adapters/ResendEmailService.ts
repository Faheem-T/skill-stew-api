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

  sendExpertApplicationApprovedMail = async (
    email: string,
  ): Promise<boolean> => {
    await this._client.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Expert Application Approved | Skill Stew",
      html: "<p>Your expert application has been approved. You can now continue as an expert on Skill Stew.</p>",
    });

    return true;
  };

  sendExpertApplicationRejectedMail = async (
    email: string,
    rejectionReason?: string,
  ): Promise<boolean> => {
    const reasonHtml = rejectionReason
      ? `<p>Reason: ${rejectionReason}</p>`
      : "";

    await this._client.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Expert Application Update | Skill Stew",
      html: `<p>Your expert application was rejected.</p>${reasonHtml}`,
    });

    return true;
  };
}
