export interface GetNotificationsForUserDTO {
  userId: string;
  lastReadId: string | undefined;
  limit: number;
}
