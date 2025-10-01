export type GetProfileOutputDTO =
  | {
      id: string;
      username: string | undefined;
      name: string | undefined;
      email: string;
      role: "USER";
    }
  | { id: string; username: string | undefined; role: "ADMIN" }
  | null;
