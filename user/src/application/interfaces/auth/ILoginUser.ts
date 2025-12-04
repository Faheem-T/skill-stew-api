export interface ILoginUser {
  exec(
    email: string,
    password: string,
  ): Promise<{ refreshToken: string; accessToken: string } | null>;
}
