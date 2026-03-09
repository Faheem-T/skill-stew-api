import { UserConnection } from "../../domain/entities/UserConnection";
import { UserConnectionsTableType } from "../db/schemas/userConnectionSchema";
import { Mapper } from "./interfaces/Mapper";

export class UserConnectionMapper implements Mapper<
  UserConnection,
  UserConnectionsTableType
> {
  toDomain = (raw: UserConnectionsTableType): UserConnection => {
    const {
      id,
      user_id_1,
      user_id_2,
      requester_id,
      status,
      created_at,
      updated_at,
    } = raw;

    return new UserConnection(
      id,
      user_id_1,
      user_id_2,
      requester_id,
      status,
      created_at,
      updated_at,
    );
  };

  toPersistence = (entity: UserConnection): UserConnectionsTableType => {
    const { id, userId1, userId2, requesterId, status, createdAt, updatedAt } =
      entity;

    return {
      id,
      user_id_1: userId1,
      user_id_2: userId2,
      requester_id: requesterId,
      status,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  };

  toPersistencePartial(
    partial: Partial<UserConnection>,
  ): Partial<UserConnectionsTableType> {
    const result: Partial<UserConnectionsTableType> = {};

    if (partial.id) result.id = partial.id;
    if (partial.userId1) result.user_id_1 = partial.userId1;
    if (partial.userId2) result.user_id_2 = partial.userId2;
    if (partial.requesterId) result.requester_id = partial.requesterId;
    if (partial.status) result.status = partial.status;
    if (partial.createdAt) result.created_at = partial.createdAt;
    if (partial.updatedAt) result.updated_at = partial.updatedAt;

    return result;
  }
}
