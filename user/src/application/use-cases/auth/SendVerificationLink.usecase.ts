import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { VerifiedUserError } from "../../../domain/errors/VerifiedUserError";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { SendVerificationLinkDTO } from "../../dtos/auth/SendVerificationLink.dto";
import { ISendVerificationLink } from "../../interfaces/auth/ISendVerificationLink";
import { IEmailService } from "../../ports/IEmailService";
import { IJwtService } from "../../ports/IJwtService";

export class SendVerificationLink implements ISendVerificationLink {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _emailService: IEmailService,
  ) {}
  exec = async ({ email }: SendVerificationLinkDTO): Promise<void> => {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User");
    }
    if (user.isVerified) {
      throw new VerifiedUserError();
    }
    const jwt = this._jwtService.generateEmailVerificationJwt({ email });
    await this._emailService.sendVerificationLinkToEmail(email, jwt);
  };
}
