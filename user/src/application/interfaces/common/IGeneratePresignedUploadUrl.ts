import { GeneratePresignedUploadUrlDTO } from "../../dtos/common/GeneratePresignedUploadUrl.dto";

export interface IGeneratePresignedUploadUrl {
  exec(
    dto: GeneratePresignedUploadUrlDTO,
  ): Promise<{ uploadUrl: string; key: string }>;
}
