import axios, { AxiosError } from "axios";
import { IUserConnectionService } from "../../application/ports/IUserConnectionService";
import { UserConnectionStatus } from "../../constants/UserConnectionStatus";
import { ENV } from "../../utils/dotenv";
import { InternalServiceError } from "../../application/errors/InternalServiceError";

interface GetConnectionStatusesResponse {
  success: true;
  data: Record<string, UserConnectionStatus>;
}

export class UserConnectionService implements IUserConnectionService {
  getConnectionStatuses = async (
    userId: string,
    targetIds: string[],
  ): Promise<Record<string, UserConnectionStatus>> => {
    try {
      const targetIdsQueryParam = targetIds.reduce(
        (acc, curr) => acc + "&targetIds=" + curr,
        "",
      );

      const res = await axios.get<GetConnectionStatusesResponse>(
        `${ENV.USER_SERVICE_URL}/api/v1/connections/statuses?userId=${userId}${targetIdsQueryParam}`,
      );

      return res.data.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new InternalServiceError("User", err);
      }
      throw err;
    }
  };
}
