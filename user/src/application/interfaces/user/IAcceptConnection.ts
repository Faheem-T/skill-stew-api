export interface IAcceptConnection {
  exec(connectionId: string, userId: string): Promise<void>;
}
