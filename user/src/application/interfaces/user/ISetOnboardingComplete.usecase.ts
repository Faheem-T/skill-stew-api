export interface ISetOnboardingComplete {
  exec(userId: string): Promise<void>;
}
