export interface ISendConnectionRequest {
  exec(requesterId: string, recipientId: string): Promise<void>;
}
