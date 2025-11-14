import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BaseRepository } from "./BaseRepository";
import { UserMapper } from "../../mappers/UserMapper";

export interface UserDoc {
  id: string;

  name?: string;
  username?: string;
  location?: { lat: number; lon: number };
  languages?: string[];
  isVerified?: boolean;

  offeredSkills?: string[];
  wantedSkills?: string[];
}

export class UserRepository
  extends BaseRepository<User, UserDoc>
  implements IUserRepository
{
  constructor(es: Client) {
    super("users", es);
  }

  protected mapper = new UserMapper();
}
