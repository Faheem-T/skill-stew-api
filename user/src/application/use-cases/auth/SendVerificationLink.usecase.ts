import { v7 as uuid } from "uuid";
import { EventName, EventPayload } from "@skillstew/common";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { VerifiedUserError } from "../../../domain/errors/VerifiedUserError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { SendVerificationLinkDTO } from "../../dtos/auth/SendVerificationLink.dto";
import { ISendVerificationLink } from "../../interfaces/auth/ISendVerificationLink";
import { IJwtService } from "../../ports/IJwtService";

export class SendVerificationLink implements ISendVerificationLink {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _outboxRepo: IOutboxEventRepository,
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

    const eventName: EventName = "resendVerificationLink.requested";
    const payload: EventPayload<typeof eventName> = {
      email,
      token: jwt,
    };

    await this._outboxRepo.create({
      id: uuid(),
      name: eventName,
      payload,
      status: "PENDING",
      createdAt: new Date(),
      processedAt: undefined,
    });
  };
}
