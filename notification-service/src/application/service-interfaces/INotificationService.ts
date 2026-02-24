import type {
  CreateNotificationDTO,
  CreateNotificationOutputDTO,
} from "../dtos/CreateNotification.dto";

export interface INotificationService {
  createNotification(
    dto: CreateNotificationDTO,
  ): Promise<CreateNotificationOutputDTO>;
}
