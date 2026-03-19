import { v7 as uuid } from "uuid";
import { EventName, EventPayload } from "@skillstew/common";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { ValidationError } from "../../errors/ValidationError";
import { IRejectExpertApplication } from "../../interfaces/expert-applications/IRejectExpertApplication";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { OutboxEvent } from "../../../domain/entities/OutboxEvent";

export class RejectExpertApplication implements IRejectExpertApplication {
  constructor(
    private _expertApplicationRepo: IExpertApplicationRepository,
    private _userRepo: IUserRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
  ) {}
  exec = async (
    applicationId: string,
    adminId: string,
    rejectionReason?: string,
  ): Promise<boolean> => {
    const application =
      await this._expertApplicationRepo.findById(applicationId);

    if (application.status !== "pending") {
      throw new ValidationError([
        {
          field: "applicationId",
          message: "Only pending expert applications can be approved.",
        },
      ]);
    }

    const applicant = await this._userRepo.findById(application.expertId);

    await this._unitOfWork.transact(async (tx) => {
      await this._expertApplicationRepo.update(
        applicationId,
        {
          status: "rejected",
          rejectionReason,
          reviewedAt: new Date(),
          reviewedByAdminId: adminId,
        },
        tx,
      );

      const eventName: EventName = "expert.application.rejected";
      const payload: EventPayload<typeof eventName> = {
        expertId: applicant.id,
        email: applicant.email,
        rejectedAt: new Date(),
        rejectedReason: rejectionReason,
      };

      const event = new OutboxEvent(
        uuid(),
        eventName,
        payload,
        "PENDING",
        new Date(),
        undefined,
      );

      await this._outboxRepo.create(event, tx);
    });

    return true;
  };
}
