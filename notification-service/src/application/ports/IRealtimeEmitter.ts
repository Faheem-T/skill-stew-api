import type { Notification } from "../../domain/entities/Notification";

export interface IRealtimeEventPublisher {
  emitToRecipient(payload: Notification): true;
}
