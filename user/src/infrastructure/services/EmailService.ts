import { IEmailService } from "../../application/ports/IEmailService";
import { logger } from "../../presentation/logger";
import { ENV } from "../../utils/dotenv";
import nodemailer from "nodemailer";

export class EmailService implements IEmailService {
  private _host: string;
  private _port: number;
  private _user: string;
  private _pass: string;
  private _baseFrontendUrl: string;

  private _transporter: nodemailer.Transporter;
  constructor() {
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
  sendVerificationLinkToEmail = async (
    email: string,
    jwt: string,
  ): Promise<void | never> => {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this._user,
      to: email,
      subject: "Account creation | SkillStew",
      text: `Click on this link to continue with your account creation: ${this._baseFrontendUrl}/set-password?token=${jwt}`,
    };
    try {
      const info = await this._transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${email}`, {
        response: info.response,
      });
    } catch (err) {
      throw new Error();
    }
  };
}
