export interface IStorageService {
  generatePresignedUrl({
    filename,
    mimetype,
  }: {
    filename: string;
    mimetype: string;
  }): Promise<string>;
  getPublicUrl(key: string): string;
}
