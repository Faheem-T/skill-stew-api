import { AnyAppEvent, AppEvent } from "@skillstew/common";
import {
  EventName,
  EventSchemas,
} from "@skillstew/common/build/events/EventMap";
import { IConsumer } from "../../application/ports/IConsumer";
import { Channel, ConsumeMessage } from "amqplib";
import { AppError } from "../../application/errors/AppError.abstract";
import { DomainError } from "../../domain/errors/DomainError.abstract";
import { logger } from "../../presentation/logger";
import { ILogger } from "../../application/ports/ILogger";
import { ISetOnboardingComplete } from "../../application/interfaces/user/ISetOnboardingComplete.usecase";

type EventHandler<T extends EventName> = (
  event: AppEvent<T>,
) => Promise<{ success: boolean; retryable?: boolean }>;

export class EventConsumer implements IConsumer {
  private _handlers = new Map<EventName, EventHandler<EventName>>();

  constructor(
    private _channel: Channel,
    private _queueName: string,
    private _exchangeName: string,
    private _logger: ILogger,
    private _setOnboardingCompleteUsecase: ISetOnboardingComplete,
  ) {
    this._channel.consume(this._queueName, this.handleEvent);
    this.registerHandler("skill.profileUpdated", async (event) => {
      await this._setOnboardingCompleteUsecase.exec(event.data.userId);
      return { success: true };
    });
  }

  registerHandler = async <T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
  ) => {
    await this._channel.bindQueue(
      this._queueName,
      this._exchangeName,
      eventName,
    );
    this._handlers.set(eventName, handler as EventHandler<EventName>);
    this._logger.info(`Registered handler for ${eventName}`);
  };

  private handleEvent = async (msg: ConsumeMessage | null) => {
    if (!msg) {
      return;
    }
    const event = JSON.parse(msg.content.toString()) as AnyAppEvent;
    const eventName = event.eventName;

    // validate using schema
    const schema = EventSchemas[eventName];
    if (!schema) {
      logger.error(`Unknown event: ${eventName}`, { event: msg });
      this._channel.nack(msg, false, false);
      return;
    }
    const parseResult = schema.safeParse(event.data);
    if (!parseResult.success) {
      logger.error(`Invalid Event payload: ${eventName}`, { event: msg });
      this._channel.nack(msg, false, false);
      return;
    }

    // create typed app event
    const appEvent: AppEvent<typeof eventName> = {
      ...event,
      data: parseResult.data,
    };

    try {
      const handler = this._handlers.get(eventName);
      if (!handler) {
        this._channel.ack(msg); // ack if no handler
        return;
      }

      const result = await handler(appEvent);

      if (result.success) {
        this._channel.ack(msg);
      } else {
        const requeue = result.retryable;
        this._channel.nack(msg, false, requeue);
      }
    } catch (err) {
      const error = err as Error;
      const errorChain = getFullErrorChain(error);

      logger.error({
        message: "Application error occurred when processing event",
        error: {
          name: error.name,
          message: error.message,
          code:
            error instanceof DomainError || error instanceof AppError
              ? error.code
              : undefined,
          stack: error.stack,
          chain: errorChain,
        },
        event: { msg },
        timestamp: new Date().toISOString(),
      });

      if (error instanceof AppError) {
        this._channel.nack(msg, false, error.retryable);
      } else {
        this._channel.nack(msg, false, false);
      }
    }
  };
}

// Helper to extract full error chain
function getFullErrorChain(error: Error): Array<{
  name: string;
  message: string;
  stack?: string;
}> {
  const chain = [];
  let currentError: Error | undefined = error;

  while (currentError) {
    chain.push({
      name: currentError.name,
      message: currentError.message,
      // Only include stack in development
      stack:
        process.env.NODE_ENV === "development" ? currentError.stack : undefined,
    });

    // Get the next error in the chain
    if ("cause" in currentError && currentError.cause instanceof Error) {
      currentError = currentError.cause;
    } else {
      break;
    }
  }

  return chain;
}
