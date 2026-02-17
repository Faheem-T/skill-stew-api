import { UserConnection } from "../../domain/entities/UserConnection";
import { UserConnectionsTableType } from "../db/schemas/userConnectionSchema";
import { Mapper } from "./interfaces/Mapper";

export class UserConnectionMapper implements Mapper<
  UserConnection,
  UserConnectionsTableType
> {
  toDomain = (raw: UserConnectionsTableType): UserConnection => {
    const { id, requester_id, recipient_id, status, created_at, updated_at } =
      raw;

    return new UserConnection(
      id,
      requester_id,
      recipient_id,
      status,
      created_at,
      updated_at,
    );
  };

  toPersistence = (entity: UserConnection): UserConnectionsTableType => {
    const { id, requesterId, recipientId, status, createdAt, updatedAt } =
      entity;

    return {
      id,
      requester_id: requesterId,
      recipient_id: recipientId,
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
    if (partial.requesterId) result.requester_id = partial.requesterId;
    if (partial.recipientId) result.recipient_id = partial.recipientId;
    if (partial.status) result.status = partial.status;
    if (partial.createdAt) result.created_at = partial.createdAt;
    if (partial.updatedAt) result.updated_at = partial.updatedAt;

    return result;
  }
}
