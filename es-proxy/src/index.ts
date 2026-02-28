import { app } from "./app.js";
import { startConsumer } from "./consumers/eventConsumer.js";
import { setupES } from "./infrastructure/config/esConnection.js";
import { ENV } from "./utils/dotenv.js";
import { logger } from "./utils/logger/index.js";

process.on("uncaughtException", (err, origin) => {
  logger.error(
    "Critical application error. Exiting process with status code 1.",
    { err, origin },
  );
  process.exit(1);
});

start();
async function start() {
  await setupES();
  await startConsumer();
  app.listen(ENV.PORT, () => {
    logger.info(`Listening on port ${ENV.PORT}`);
  });
}
