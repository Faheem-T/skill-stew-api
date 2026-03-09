import { Emitter } from "@socket.io/redis-emitter";
import { Redis } from "ioredis";
import { injectable, inject } from "inversify";
import type { Notification } from "../../domain/entities/Notification";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import { TYPES } from "../../constants/Types";
import type { ILogger } from "../../application/ports/ILogger";

@injectable()
export class SocketIoRedisPublisher implements IRealtimeEventPublisher {
  private _io: Emitter;
  constructor(
    @inject(TYPES.Logger) private _logger: ILogger,
    @inject(TYPES.RedisClient) private _redisClient: Redis,
  ) {
    this._io = new Emitter(this._redisClient);
  }

  emitToRecipient = (payload: Notification): true => {
    this._logger.info("Emitting realtime event", {
      eventId: payload.id,
      eventType: payload.type,
      recipientId: payload.recipientId,
    });

    try {
      this._io
        .to(`user:${payload.recipientId}`)
        .emit("notification:new", payload);

      this._logger.info("Successfully emitted event", {
        eventId: payload.id,
        eventType: payload.type,
      });

      return true;
    } catch (err) {
      this._logger.error("Error when emitting event", { error: err });
      return true;
    }
  };
}
