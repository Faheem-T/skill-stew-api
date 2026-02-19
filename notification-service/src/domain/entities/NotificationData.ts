import { NotificationType } from "./NotificationType.enum";

export interface ConnectionRequestData {
  type: NotificationType.CONNECTION_REQUEST;
  senderId: string;
  senderUsername: string;
  connectionId: string;
}

export interface ConnectionAcceptedData {
  type: NotificationType.CONNECTION_ACCEPTED;
  accepterId: string;
  accepterUsername: string;
  connectionId: string;
}

export interface ConnectionRejectedData {
  type: NotificationType.CONNECTION_REJECTED;
  rejecterId: string;
  rejecterUsername: string;
  connectionId: string;
}

export type NotificationData =
  | ConnectionRequestData
  | ConnectionAcceptedData
  | ConnectionRejectedData;
