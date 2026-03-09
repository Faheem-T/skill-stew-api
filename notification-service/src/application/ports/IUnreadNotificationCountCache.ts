export interface IUnreadNotificationCountCache {
  getByUserId(userId: string): Promise<number | null>;
  setByUserId(userId: string, count: number): Promise<number>;
  incrementByUserId(userId: string, inc: number): Promise<number>;
  decrementByUserId(userId: string, dec: number): Promise<number>;
}
