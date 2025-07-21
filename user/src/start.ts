import { ENV } from "./config/dotenv";
import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { userSchema } from "./2-infrastructure/db/schemas/userSchema";
import amqp from "amqplib/callback_api";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
  // schema: { userSchema },
});

async function start() {
  try {
    console.log("Attempting to ping database...");
    await db.execute("select 1");
    console.log("Successfully pinged database");
  } catch (err) {
    console.log("Error while pinging database", err);
  }
  console.log("Connected to database");

  app.listen(ENV.PORT, () => {
    console.log(`Listening on port ${ENV.PORT}`);
  });

  amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
    function (err, connection) {
      if (err) {
        throw err;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        var queue = "hello";
        var msg = "Hello world";

        channel.assertQueue(queue, {
          durable: false,
        });

        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
        channel.consume(
          queue,
          function (msg) {
            console.log(" [x] Received %s", msg?.content.toString());
          },
          {
            noAck: true,
          },
        );
      });
    },
  );
}
start();

// Disconnect from db when process is exiting
process.on("exit", async () => {
  await db.$client.end();
  console.log("Disconnected from database");
});
