export class AdminProfile {
  constructor(
    public id: string,
    public userId: string,
    public name?: string,
    public avatarKey?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
