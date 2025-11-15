import { app } from "./app.js";
import { startConsumer } from "./consumers/eventConsumer.js";
import { setupES } from "./infrastructure/config/esConnection.js";
import { ENV } from "./utils/dotenv.js";
import { logger } from "./utils/logger/index.js";

start();
async function start() {
  await setupES();
  await startConsumer();
  app.listen(ENV.PORT, () => {
    logger.info(`Listening on port ${ENV.PORT}`);
  });
}
