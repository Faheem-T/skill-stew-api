export class Admin {
  id?: string;
  username: string;
  passwordHash: string;

  constructor(username: string, passwordHash: string, id?: string) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.id = id;
  }
}
