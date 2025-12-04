export interface ICreateAdmin {
  exec(username: string, password: string): Promise<void>;
}
