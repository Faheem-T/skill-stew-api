import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AdminGetUserOutputDTO } from "../../dtos/admin/GetUsers.dto";
import { UpdateUserBlockStatusDTO } from "../../dtos/admin/UpdateUserBlockStatus.dto";
import { IUpdateUserBlockStatus } from "../../interfaces/admin/IUpdateUserBlockStatus";

export class UpdateUserBlockStatus implements IUpdateUserBlockStatus {
  constructor(private _userRepo: IUserRepository) {}
  exec = async (
    dto: UpdateUserBlockStatusDTO,
  ): Promise<AdminGetUserOutputDTO | null> => {
    const { userId, newBlockStatus } = dto;

    const user = await this._userRepo.update(userId, {
      isBlocked: newBlockStatus,
    });

    return user ?? null;
  };
}
