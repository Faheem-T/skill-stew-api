import { Container } from "inversify";
import amqp from "amqplib";
import Redis from "ioredis";

import { TYPES } from "../constants/Types";
import { NotificationRepository } from "../infrastructure/repositories/NotificationRepository";
import type { INotificationRepository } from "../domain/repositories/INotificationRepository";
import type { INotificationService } from "../application/service-interfaces/INotificationService";
import { NotificationService } from "../application/services/NotificationService";
import type { ILogger } from "../application/ports/ILogger";
import { WinstonLogger } from "../infrastructure/adapters/WinstonLogger";
import type { IEventConsumer } from "../application/ports/IEventConsumer";
import { RabbitMQEventConsumer } from "../infrastructure/adapters/RabbitMQEventConsumer";
import { ENV } from "../utils/dotenv";
import type { IRealtimeEventPublisher } from "../application/ports/IRealtimeEmitter";
import { SocketIoRedisPublisher } from "../infrastructure/adapters/SocketIoRedisPublisher";
import { NotificationController } from "../http/controllers/NotificationController";

const container = new Container();

container
  .bind<INotificationRepository>(TYPES.NotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();

container
  .bind<INotificationService>(TYPES.NotificationService)
  .to(NotificationService)
  .inSingletonScope();

container.bind<ILogger>(TYPES.Logger).to(WinstonLogger).inSingletonScope();

container
  .bind<IEventConsumer>(TYPES.EventConsumer)
  .toDynamicValue(async (context) => {
    const logger = context.get<ILogger>(TYPES.Logger);
    const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
    const channel = await connection.createChannel();
    await channel.assertExchange(ENV.RABBIT_MQ_EXCHANGE_NAME, "topic", {
      durable: true,
    });
    const queue = await channel.assertQueue(ENV.RABBIT_MQ_QUEUE_NAME, {
      durable: true,
    });
    return new RabbitMQEventConsumer(
      channel,
      queue.queue,
      ENV.RABBIT_MQ_EXCHANGE_NAME,
      logger,
    );
  })
  .inSingletonScope();

container
  .bind<IRealtimeEventPublisher>(TYPES.RealtimeEventPublisher)
  .to(SocketIoRedisPublisher)
  .inSingletonScope();

container
  .bind<NotificationController>(TYPES.NotificationController)
  .to(NotificationController)
  .inSingletonScope();

container
  .bind<Redis>(TYPES.RedisClient)
  .toConstantValue(new Redis(ENV.REDIS_URI));

export { container };
