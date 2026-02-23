import { Container } from "inversify";
import { TYPES } from "../constants/Types";
import { NotificationRepository } from "../infrastructure/repositories/NotificationRepository";
import type { INotificationRepository } from "../domain/repositories/INotificationRepository";

const container = new Container();

container
  .bind<INotificationRepository>(TYPES.NotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();
