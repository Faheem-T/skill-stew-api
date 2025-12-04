export interface IGoogleAuth {
  exec(
    credential: string,
  ): Promise<{ refreshToken: string; accessToken: string }>;
}
