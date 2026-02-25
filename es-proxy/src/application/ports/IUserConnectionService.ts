import { UserConnectionStatus } from "../../constants/UserConnectionStatus";

export interface IUserConnectionService {
  getConnectionStatuses(
    userId: string,
    targetIds: string[],
  ): Promise<Record<string, UserConnectionStatus>>;
}
