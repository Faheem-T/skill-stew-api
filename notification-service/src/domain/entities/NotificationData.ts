import { NotificationType } from "./NotificationType.enum";

export interface ConnectionRequestData {
  type: NotificationType.CONNECTION_REQUEST;
  senderId: string;
  senderUsername: string | undefined;
  connectionId: string;
}

export interface ConnectionAcceptedData {
  type: NotificationType.CONNECTION_ACCEPTED;
  accepterId: string;
  accepterUsername: string | undefined;
  connectionId: string;
}

export interface ConnectionRejectedData {
  type: NotificationType.CONNECTION_REJECTED;
  rejecterId: string;
  rejecterUsername: string | undefined;
  connectionId: string;
}

export interface ExpertApplicationApprovedData {
  type: NotificationType.EXPERT_APPLICATION_APPROVED;
  approvedAt: Date;
}

export interface ExpertApplicationRejectedData {
  type: NotificationType.EXPERT_APPLICATION_REJECTED;
  rejectedAt: Date;
  rejectionReason?: string;
}

export type NotificationData =
  | ConnectionRequestData
  | ConnectionAcceptedData
  | ConnectionRejectedData
  | ExpertApplicationApprovedData
  | ExpertApplicationRejectedData;
