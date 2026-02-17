import { Channel } from "amqplib";
import { IProducer } from "../../application/ports/IProducer";
import { AnyAppEvent } from "@skillstew/common";
import { ILogger } from "../../application/ports/ILogger";

export class EventProducer implements IProducer {
  constructor(
    private _channel: Channel,
    private _exchange: string,
    private _logger: ILogger,
  ) {}

  publish = (event: AnyAppEvent) => {
    const routingKey = event.eventName;
    const message = Buffer.from(JSON.stringify(event));

    this._logger.info({
      message: `Publishing ${routingKey}`,
      eventMessage: message,
    });

    this._channel.publish(this._exchange, routingKey, message, {
      persistent: true,
    });
  };
}
