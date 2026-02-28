export interface IUnreadNotificationCountRepository {
  getByUserId(userId: string): Promise<number>;
  createByUserId(userId: string): Promise<number>;
  incrementByUserId(userId: string, inc: number): Promise<number>;
  decrementByUserId(userId: string, dec: number): Promise<number>;
}
