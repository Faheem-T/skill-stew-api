import type { IStorageService } from "../../application/ports/IStorageService";
import { ENV } from "../../utils/dotenv";

export class S3StorageService implements IStorageService {
  getPublicUrl(key: string): string {
    return `https://${ENV.CDN_DOMAIN_NAME}/${key}`;
  }
}
