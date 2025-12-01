import { v7 as uuidv7 } from "uuid";

export class Admin {
  id: string;
  username: string;
  passwordHash: string;
  avatarKey?: string;

  constructor(username: string, passwordHash: string, id?: string) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.id = id ?? uuidv7();
  }
}
