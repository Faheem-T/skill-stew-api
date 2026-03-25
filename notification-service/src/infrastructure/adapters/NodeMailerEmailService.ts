import { inject, injectable } from "inversify";
import type { IEmailService } from "../../application/ports/IEmailService";
import { ENV } from "../../utils/dotenv";
import nodemailer from "nodemailer";
import { TYPES } from "../../constants/Types";
import type { ILogger } from "../../application/ports/ILogger";

@injectable()
export class NodeMailerEmailService implements IEmailService {
  private _host: string;
  private _port: number;
  private _user: string;
  private _pass: string;
  private _baseFrontendUrl: string;

  private _transporter: nodemailer.Transporter;
  constructor(@inject(TYPES.Logger) private _logger: ILogger) {
    this._host = ENV.NODE_MAILER_HOST;
    this._port = Number(ENV.NODE_MAILER_PORT);
    this._user = ENV.NODE_MAILER_GMAIL;
    this._pass = ENV.NODE_MAILER_GMAIL_APP_PASSWORD;
    this._baseFrontendUrl = ENV.BASE_FRONTEND_URL;

    this._transporter = nodemailer.createTransport({
      host: this._host,
      port: this._port,
      secure: true,
      auth: {
        user: this._user,
        pass: this._pass,
      },
    });
  }
  sendVerificationMail = async (
    email: string,
    verificationLink: string,
  ): Promise<boolean> => {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this._user,
      to: email,
      subject: "Account Verification | Skill Stew",
      html: `<a href=${verificationLink}>Click here to verify your account</a>`,
    };

    const info = await this._transporter.sendMail(mailOptions);

    this._logger.info(`Email sent successfully to ${email}`, {
      response: info.response,
    });
    return true;
  };

  sendExpertApplicationApprovedMail = async (
    email: string,
  ): Promise<boolean> => {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this._user,
      to: email,
      subject: "Expert Application Approved | Skill Stew",
      html: "<p>Your expert application has been approved. You can now continue as an expert on Skill Stew.</p>",
    };

    const info = await this._transporter.sendMail(mailOptions);

    this._logger.info(`Approval email sent successfully to ${email}`, {
      response: info.response,
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

    const mailOptions: nodemailer.SendMailOptions = {
      from: this._user,
      to: email,
      subject: "Expert Application Update | Skill Stew",
      html: `<p>Your expert application was rejected.</p>${reasonHtml}`,
    };

    const info = await this._transporter.sendMail(mailOptions);

    this._logger.info(`Rejection email sent successfully to ${email}`, {
      response: info.response,
    });

    return true;
  };
}
