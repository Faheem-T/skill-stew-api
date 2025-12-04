export interface IGenerateAccessToken {
  exec(refreshToken: string): Promise<string>;
}
