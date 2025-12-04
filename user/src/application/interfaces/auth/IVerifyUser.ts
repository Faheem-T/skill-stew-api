export interface IVerifyUser {
  exec(verificationToken: string): Promise<void>;
}
