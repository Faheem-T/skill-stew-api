import type { AppEvent } from "@skillstew/common";
import type { IEmailService } from "../../application/ports/IEmailService";
import { ENV } from "../../utils/dotenv";
import type { ILogger } from "../../application/ports/ILogger";

export const userRegisteredHandler =
  (emailService: IEmailService, logger: ILogger) =>
  async (event: AppEvent<"user.registered">) => {
    const { email, token } = event.data;

    if (!token) {
      logger.info("Not sending verification email as token is empty", {
        email,
      });

      return { success: true };
    }

    const verificationLink = `${ENV.EMAIL_VERIFICATION_REDIRECT_URL}?token=${token}`;

    logger.info("Sending verification link", { email, verificationLink });

    await emailService.sendVerificationMail(email, verificationLink);

    return { success: true };
  };
