import { UserConnection } from "../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../domain/repositories/IUserConnectionRepository";
import { userConnectionsTable } from "../db/schemas/userConnectionSchema";
import { UserConnectionMapper } from "../mappers/UserConnectionMapper";
import { BaseRepository } from "./BaseRepository";

export class UserConnectionRepository
  extends BaseRepository<UserConnection, typeof userConnectionsTable>
  implements IUserConnectionRepository
{
  constructor() {
    super(userConnectionsTable);
  }
  mapper = new UserConnectionMapper();
}
