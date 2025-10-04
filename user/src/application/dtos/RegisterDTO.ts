export type RegisterOutputDTO =
  | {
      success: true;
    }
  | {
      success: false;
      userAlreadyExists: boolean;
    };
