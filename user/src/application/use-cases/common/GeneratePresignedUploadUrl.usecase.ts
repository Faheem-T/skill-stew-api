import { GeneratePresignedUploadUrlDTO } from "../../dtos/common/GeneratePresignedUploadUrl.dto";
import { IGeneratePresignedUploadUrl } from "../../interfaces/common/IGeneratePresignedUploadUrl";
import { IStorageService } from "../../ports/IStorageService";

export class GeneratePresignedUploadUrl implements IGeneratePresignedUploadUrl {
  constructor(private _storageService: IStorageService) {}
  exec = async (
    dto: GeneratePresignedUploadUrlDTO,
  ): Promise<{ uploadUrl: string; key: string }> => {
    const { type, mimetype, userId, userRole } = dto;

    let folder = "users";
    switch (userRole) {
      case "EXPERT":
        folder = "experts";
        break;
      case "ADMIN":
        folder = "admins";
        break;
    }

    const extension = mimetype.split("/")[1];

    const filename = `${folder}/${userId}/${type}.${extension}`;

    const url = await this._storageService.generatePresignedUrl({
      filename,
      mimetype,
    });

    return { uploadUrl: url, key: filename };
  };
}
