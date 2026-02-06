import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IStorageService } from "../../application/ports/IStorageService";
import client from "../storage/aws-s3/client";
import { ENV } from "../../utils/dotenv";

export class S3StorageService implements IStorageService {
  generatePresignedUrl = async ({
    filename,
    mimetype,
  }: {
    filename: string;
    mimetype: string;
  }): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket: ENV.S3_BUCKET_NAME,
      Key: filename,
      ContentType: mimetype,
    });
    const url = await getSignedUrl(client, command, {
      expiresIn: 600 /* 10 minutes */,
    });
    return url;
  };

  getPublicUrl(key: string): string {
    return `https://${ENV.CDN_DOMAIN_NAME}/${key}`;
  }
}
