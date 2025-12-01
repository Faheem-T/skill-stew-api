export interface IGetCurrentAdminProfile {
  exec(adminId: string): Promise<{ username: string; role: "ADMIN" }>;
}
