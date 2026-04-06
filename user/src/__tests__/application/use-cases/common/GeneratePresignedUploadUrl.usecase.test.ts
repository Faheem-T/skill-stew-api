import { describe, expect, it, jest } from "@jest/globals";
import { GeneratePresignedUploadUrl } from "../../../../application/use-cases/common/GeneratePresignedUploadUrl.usecase";
import type { IStorageService } from "../../../../application/ports/IStorageService";

let uuidCall = 0;
jest.mock("uuid", () => ({
  v7: () => {
    uuidCall += 1;
    return `generated-uuid-${uuidCall}`;
  },
}));

describe("GeneratePresignedUploadUrl", () => {
  it("generates a unique workshop banner path for experts", async () => {
    const generatePresignedUrl = jest
      .fn<IStorageService["generatePresignedUrl"]>()
      .mockResolvedValue("https://upload.test/presigned");

    const storageService: IStorageService = {
      generatePresignedUrl,
      getPublicUrl: jest.fn<(key: string) => string>().mockReturnValue(""),
    };

    const usecase = new GeneratePresignedUploadUrl(storageService);

    const result = await usecase.exec({
      userId: "expert-123",
      userRole: "EXPERT",
      type: "workshopBanner",
      mimetype: "image/webp",
    });

    expect(storageService.generatePresignedUrl).toHaveBeenCalledWith({
      filename: "experts/expert-123/workshops/generated-uuid-1/banner.webp",
      mimetype: "image/webp",
    });
    expect(result).toEqual({
      uploadUrl: "https://upload.test/presigned",
      key: "experts/expert-123/workshops/generated-uuid-1/banner.webp",
    });
  });

  it("preserves the existing profile banner path for experts", async () => {
    const generatePresignedUrl = jest
      .fn<IStorageService["generatePresignedUrl"]>()
      .mockResolvedValue("https://upload.test/presigned");

    const storageService: IStorageService = {
      generatePresignedUrl,
      getPublicUrl: jest.fn<(key: string) => string>().mockReturnValue(""),
    };

    const usecase = new GeneratePresignedUploadUrl(storageService);

    const result = await usecase.exec({
      userId: "expert-123",
      userRole: "EXPERT",
      type: "banner",
      mimetype: "image/jpeg",
    });

    expect(storageService.generatePresignedUrl).toHaveBeenCalledWith({
      filename: "experts/expert-123/banner.jpeg",
      mimetype: "image/jpeg",
    });
    expect(result).toEqual({
      uploadUrl: "https://upload.test/presigned",
      key: "experts/expert-123/banner.jpeg",
    });
  });
});
