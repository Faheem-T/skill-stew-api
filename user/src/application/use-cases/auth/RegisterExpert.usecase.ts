import { v7 as uuid } from "uuid";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { RegisterExpertDTO } from "../../dtos/auth/RegisterExpert.dto";
import { IRegisterExpert } from "../../interfaces/auth/IRegisterExpert";
import { IHasherService } from "../../ports/IHasherService";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { EventName, EventPayload } from "@skillstew/common";
import { IJwtService } from "../../ports/IJwtService";
import { DbUniqueConstraintError } from "../../errors/infra/DbUniqueConstraintError";
import { AlreadyExistsError } from "../../../domain/errors/AlreadyExistsError";

export class RegisterExpert implements IRegisterExpert {
  constructor(
    private _userRepo: IUserRepository,
    private _hasherService: IHasherService,
    private _unitOfWork: IUnitOfWork,
    private _outboxRepo: IOutboxEventRepository,
    private _jwtService: IJwtService,
  ) {}

  exec = async (dto: RegisterExpertDTO): Promise<void> => {
    const { email, password } = dto;
    const expert = new User(
      uuid(),
      email,
      "EXPERT_APPLICANT",
      false,
      false,
      false,
      undefined,
      this._hasherService.hash(password),
      new Date(),
      new Date(),
    );

    await this._unitOfWork.transact(async (tx) => {
      let savedExpert;
      try {
        savedExpert = await this._userRepo.create(expert, tx);
      } catch (err) {
        if (err instanceof DbUniqueConstraintError) {
          throw new AlreadyExistsError("Email");
        } else {
          throw err;
        }
      }

      const token = this._jwtService.generateEmailVerificationJwt({
        email: savedExpert.email,
      });

      const eventName: EventName = "expert.registered";
      const payload: EventPayload<typeof eventName> = {
        id: savedExpert.id,
        email: savedExpert.email,
        token,
      };

      await this._outboxRepo.create(
        {
          id: uuid(),
          name: eventName,
          payload,
          status: "PENDING",
          createdAt: new Date(),
          processedAt: undefined,
        },
        tx,
      );
    });
  };
}
