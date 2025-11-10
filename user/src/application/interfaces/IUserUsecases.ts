import {
  GetAllUsersInputDTO,
  GetAllUsersOutputDTO,
  PresentationUser,
} from "../dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "../dtos/UpdateProfileDTO";

export interface IUserUsecases {
  createDummyUsers(): Promise<void>;
  getAllUsers(dto: GetAllUsersInputDTO): Promise<GetAllUsersOutputDTO>;
  blockUser(userId: string): Promise<PresentationUser | null>;
  unblockUser(userId: string): Promise<PresentationUser | null>;
  updateProfile(dto: UpdateProfileDTO): Promise<PresentationUser | null>;
}
