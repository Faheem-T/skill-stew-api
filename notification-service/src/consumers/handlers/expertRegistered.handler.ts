import type { AppEvent } from "@skillstew/common";
import type { IEmailService } from "../../application/ports/IEmailService";
import { ENV } from "../../utils/dotenv";
import type { ILogger } from "../../application/ports/ILogger";

export const expertRegisteredHandler =
  (emailService: IEmailService, logger: ILogger) =>
  async (event: AppEvent<"expert.registered">) => {
    const { email, token } = event.data;

    const verificationLink = `${ENV.EMAIL_VERIFICATION_REDIRECT_URL}?token=${token}`;

    logger.info("Sending verification link", { email, verificationLink });

    await emailService.sendVerificationMail(email, verificationLink);

    return { success: true };
  };
