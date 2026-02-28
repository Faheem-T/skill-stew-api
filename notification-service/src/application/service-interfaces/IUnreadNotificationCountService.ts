export interface IUnreadNotificationCountService {
  getUnreadCountForUser(userId: string): Promise<number>;
}
