import { Emitter } from "@socket.io/redis-emitter";
import { Redis } from "ioredis";
import { injectable, inject } from "inversify";
import { ENV } from "../../utils/dotenv";
import type { Notification } from "../../domain/entities/Notification";
import type { IRealtimeEventPublisher } from "../../application/ports/IRealtimeEmitter";
import { TYPES } from "../../constants/Types";
import type { ILogger } from "../../application/ports/ILogger";

@injectable()
export class SocketIoRedisPublisher implements IRealtimeEventPublisher {
  private _redisClient: Redis = new Redis(ENV.REDIS_URI);
  private _io = new Emitter(this._redisClient);
  constructor(@inject(TYPES.Logger) private _logger: ILogger) {}

  emitToRecipient = (payload: Notification): true => {
    this._logger.debug("Emitting realtime event", {
      eventId: payload.id,
      eventType: payload.type,
      recipientId: payload.recipientId,
    });

    try {
      this._io
        .to(`user:${payload.recipientId}`)
        .emit("notification:new", payload);

      this._logger.debug("Successfully emitted event", {
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
