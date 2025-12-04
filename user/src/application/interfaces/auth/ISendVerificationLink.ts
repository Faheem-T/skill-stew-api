export interface ISendVerificationLink {
  exec(email: string): Promise<void>;
}
