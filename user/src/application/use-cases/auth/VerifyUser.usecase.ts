import { CreateEvent, Producer } from "@skillstew/common";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IVerifyUser } from "../../interfaces/auth/IVerifyUser";
import { IJwtService } from "../../ports/IJwtService";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError";
import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { VerifyUserDTO } from "../../dtos/auth/VerifyUser.dto";

export class VerifyUser implements IVerifyUser {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _messageProducer: Producer,
  ) {}
  exec = async ({ token }: VerifyUserDTO): Promise<void> => {
    const payload = this._jwtService.verifyEmailVerificationJwt(token);
    const email = payload.email;
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.isVerified) {
      throw new DomainValidationError("USER_ALREADY_VERIFIED");
    }
    user.isVerified = true;
    await this._userRepo.update(user.id, user);
    this._messageProducer.publish(
      CreateEvent("user.verified", { id: user.id! }, "user-service"),
    );
  };
}
