import amqp, { Channel } from "amqplib/callback_api";

export class RabbitMQService {
  channel: Channel | undefined;
  exchange = "app_exchange";
  constructor(connectionURL: string) {
    amqp.connect(connectionURL, (err0, connection) => {
      if (err0) {
        throw err0;
      }
      connection.createChannel((err1, channel) => {
        if (err1) {
          throw err1;
        }
        this.channel = channel;
      });
    });
  }

  consume = (topics: string[]) => {
    this.channel?.assertExchange(this.exchange, "topic", { durable: false });
    this.channel?.assertQueue("", { exclusive: true }, (err, q) => {
      if (err) {
        throw err;
      }
      topics.forEach((topic) => {
        this.channel?.bindQueue(q.queue, this.exchange, topic);
      });
      this.channel?.consume(
        q.queue,
        (msg) => {
          console.log(msg);
        },
        {
          noAck: true, // I should probably change this to manual acknowledgements
        },
      );
    });
  };

  publish = (data: object, queue: string) => {
    this.channel?.publish(
      this.exchange,
      queue,
      Buffer.from(JSON.stringify(data)),
    );
  };
}
