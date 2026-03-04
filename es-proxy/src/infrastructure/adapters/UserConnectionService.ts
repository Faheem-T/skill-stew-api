import axios, { AxiosError } from "axios";
import { IUserConnectionService } from "../../application/ports/IUserConnectionService";
import { ENV } from "../../utils/dotenv";
import { InternalServiceError } from "../../application/errors/InternalServiceError";

interface GetConnectedUserIdsResponse {
  success: true;
  data: {
    userId: string;
    status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED";
  }[];
}

export class UserConnectionService implements IUserConnectionService {
  getConnectedUserIds = async (
    userId: string,
  ): Promise<
    {
      userId: string;
      status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED";
    }[]
  > => {
    try {
      const res = await axios.get<GetConnectedUserIdsResponse>(
        ENV.USER_SERVICE_URL +
          "/api/v1/connections/" +
          userId +
          "/connected-ids",
      );

      return res.data.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new InternalServiceError("User service", err);
      }
      throw err;
    }
  };
}
