import { CreateEvent, Producer } from "@skillstew/common";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IVerifyUser } from "../../interfaces/auth/IVerifyUser";
import { IJwtService } from "../../ports/IJwtService";
import { VerifyUserDTO } from "../../dtos/auth/VerifyUser.dto";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { VerifiedUserError } from "../../../domain/errors/VerifiedUserError";

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
      throw new NotFoundError("User");
    }
    if (user.isVerified) {
      throw new VerifiedUserError();
    }
    user.isVerified = true;
    await this._userRepo.update(user.id, user);
    this._messageProducer.publish(
      CreateEvent("user.verified", { id: user.id! }, "user-service"),
    );
  };
}
