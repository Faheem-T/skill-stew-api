import axios, { AxiosError } from "axios";
import { IUserConnectionService } from "../../application/ports/IUserConnectionService";
import { UserConnectionStatus } from "../../constants/UserConnectionStatus";
import { ENV } from "../../utils/dotenv";
import { InternalServiceError } from "../../application/errors/InternalServiceError";

interface GetConnectionStatusesResponse {
  success: true;
  data: Record<string, UserConnectionStatus>;
}

export class UserConnectionService implements IUserConnectionService {}
