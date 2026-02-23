import type { CreateNotificationDTO } from "../dtos/CreateNotification.dto";

export interface INotificationService {
  createNotification(dto: CreateNotificationDTO): Promise<void>;
}
