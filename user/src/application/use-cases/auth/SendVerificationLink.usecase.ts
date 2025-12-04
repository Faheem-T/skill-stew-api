import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ISendVerificationLink } from "../../interfaces/auth/ISendVerificationLink";
import { IEmailService } from "../../ports/IEmailService";
import { IJwtService } from "../../ports/IJwtService";

export class SendVerificationLink implements ISendVerificationLink {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _emailService: IEmailService,
  ) {}
  exec = async (email: string): Promise<void> => {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.isVerified) {
      throw new DomainValidationError("USER_ALREADY_VERIFIED");
    }
    const jwt = this._jwtService.generateEmailVerificationJwt({ email });
    await this._emailService.sendVerificationLinkToEmail(email, jwt);
  };
}
