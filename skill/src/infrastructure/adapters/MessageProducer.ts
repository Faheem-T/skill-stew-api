import { type Channel } from "amqplib";
import { type AnyAppEvent } from "@skillstew/common";
import type { IMessageProducer } from "../../application/ports/IMessageProducer";

export class MessageProducer implements IMessageProducer {
  constructor(
    private _channel: Channel,
    private _exchange: string,
  ) {}

  publish = (event: AnyAppEvent) => {
    const routingKey = event.eventName;
    const message = Buffer.from(JSON.stringify(event));
    this._channel.publish(this._exchange, routingKey, message, {
      persistent: true,
    });
  };
}
