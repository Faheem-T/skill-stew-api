import { Channel, ConsumeMessage } from "amqplib";
import { EventName, EventSchemas } from "./EventMap";
import { AnyAppEvent, AppEvent } from "./AppEvent";
import {
  ConsumerUsedBeforeInitializationError,
  InvalidEventPayloadError,
  UnknownEventError,
} from "../errors/MessageQueueErrors";
import z from "zod";

export class Consumer {
  private _channel!: Channel;
  private _exchange!: string;
  private _initialized: boolean = false;
  private _handlers = new Map<
    EventName,
    (event: any) => Promise<HandlerResult>
  >();
  constructor() {}

  init = async (
    channel: Channel,
    exchange: string,
    serviceName: string,
    interestedEvents: (string | EventName)[], // ex: user.#, payments.subscribed
  ) => {
    this._channel = channel;
    this._exchange = exchange;
    await this._channel.assertExchange(this._exchange, "topic", {
      durable: true,
    });

    const queue = await this._channel.assertQueue(`${serviceName}_queue`, {
      durable: true,
    });

    await Promise.all(
      interestedEvents.map((eventName) =>
        this._channel.bindQueue(queue.queue, this._exchange, eventName),
      ),
    );

    this._channel.consume(queue.queue, this.handleEvent, { noAck: false });

    this._initialized = true;
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
      throw new UnknownEventError(eventName);
    }
    const parseResult = schema.safeParse(event.data);
    if (!parseResult.success) {
      this._channel.nack(msg);
      const error = z.prettifyError(parseResult.error);
      throw new InvalidEventPayloadError(eventName, error);
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
      console.log(err);
      this._channel.nack(msg, false, false);
    }
  };

  registerHandler = <T extends EventName>(
    eventName: T,
    handler: (event: AppEvent<T>) => Promise<HandlerResult>,
  ) => {
    if (!this._initialized) {
      throw new ConsumerUsedBeforeInitializationError();
    }
    this._handlers.set(eventName, handler);
  };
}

interface HandlerResult {
  success: boolean;
  retryable?: boolean;
}
