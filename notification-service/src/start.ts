import "reflect-metadata";
import { container } from "./container";
import { TYPES } from "./constants/Types";
import type { IEventConsumer } from "./application/ports/IEventConsumer";
import type { ILogger } from "./application/ports/ILogger";

const logger = container.get<ILogger>(TYPES.Logger);
await container.getAsync<IEventConsumer>(TYPES.EventConsumer);

logger.info("RabbitMQ event consumer set up successfully");
