export type RegisterOutputDTO =
  | {
      success: true;
      refreshToken: string;
      accessToken: string;
    }
  | {
      success: false;
      userAlreadyExists: boolean;
    };
