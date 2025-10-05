import { app } from "./app";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";

async function start() {
  app.listen(ENV.PORT);
  logger.info(`Listening on port ${ENV.PORT}`);
}

start();
