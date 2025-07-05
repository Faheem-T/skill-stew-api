import {
  EmailVerificationJWTPayload,
  IJwtService,
} from "../../1-application/ports/IJwtService";
import { ENV } from "../../config/dotenv";
import jwt from "jsonwebtoken";
import { EmailVerificationJwtVerifyError } from "../errors/JwtErrors";

export class JwtService implements IJwtService {
  EMAIL_SECRET: string;
  constructor() {
    this.EMAIL_SECRET = ENV.EMAIL_VERIFICATON_JWT_SECRET;
  }
  generateEmailVerificationJwt(email: string): string {
    return jwt.sign({ email }, this.EMAIL_SECRET, { expiresIn: 600 }); // expires in 10m
  }

  verifyEmailVerificationJwt(
    jwtToken: string,
  ): EmailVerificationJWTPayload | never {
    try {
      const decoded = <EmailVerificationJWTPayload>(
        jwt.verify(jwtToken, this.EMAIL_SECRET)
      );
      return decoded;
    } catch (err) {
      console.log("Email jwt verification error: ", err);
      console.log("jwt:", jwtToken);
      throw new EmailVerificationJwtVerifyError();
    }
  }
}
