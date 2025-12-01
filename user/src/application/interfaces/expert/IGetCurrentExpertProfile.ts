export interface IGetCurrentExpertProfile {
  exec(expertId: string): Promise<any>;
}
