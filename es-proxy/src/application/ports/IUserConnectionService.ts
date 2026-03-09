export interface IUserConnectionService {
  getConnectedUserIds(userId: string): Promise<
    {
      userId: string;
      status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED";
    }[]
  >;
}
