import { Channel } from "amqplib";
import { AnyAppEvent } from "./AppEvent";
import { ProducerUsedBeforeInitializationError } from "../errors/MessageQueueErrors";

export class Producer {
  private _channel!: Channel;
  private _exchange!: string;
  private _initialized: boolean = false;
  constructor() {}

  init = async (channel: Channel, exchange: string) => {
    this._channel = channel;
    this._exchange = exchange;
    await this._channel.assertExchange(this._exchange, "topic", {
      durable: true,
    });
    this._initialized = true;
  };

  publish = (event: AnyAppEvent) => {
    if (!this._initialized) {
      throw new ProducerUsedBeforeInitializationError();
    }
    const routingKey = event.eventName;
    const message = Buffer.from(JSON.stringify(event));
    this._channel.publish(this._exchange, routingKey, message, {
      persistent: true,
    });
  };
}
