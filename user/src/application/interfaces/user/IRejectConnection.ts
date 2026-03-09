export interface IRejectConnection {
  exec(connectionId: string, userId: string): Promise<void>;
}
