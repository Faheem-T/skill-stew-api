import {
  GetAllUsersInputDTO,
  GetAllUsersOutputDTO,
  PresentationUser,
} from "../dtos/GetAllUsersDTO";

export interface IUserUsecases {
  getAllUsers(dto: GetAllUsersInputDTO): Promise<GetAllUsersOutputDTO>;
  blockUser(userId: string): Promise<PresentationUser | null>;
  unblockUser(userId: string): Promise<PresentationUser | null>;
}
