import { EventName, EventPayload } from "@skillstew/common";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IVerifyUser } from "../../interfaces/auth/IVerifyUser";
import { IJwtService } from "../../ports/IJwtService";
import { VerifyUserDTO } from "../../dtos/auth/VerifyUser.dto";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { VerifiedUserError } from "../../../domain/errors/VerifiedUserError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { v7 as uuidv7 } from "uuid";

export class VerifyUser implements IVerifyUser {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
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
    await this._unitOfWork.transact(async (tx) => {
      await this._userRepo.update(user.id, user, tx);

      const eventName: EventName = "user.verified";
      const eventPayload: EventPayload<typeof eventName> = {
        id: user.id!,
      };

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: eventName,
          payload: eventPayload,
          status: "PENDING",
          createdAt: new Date(),
          processedAt: undefined,
        },
        tx,
      );
    });
  };
}
