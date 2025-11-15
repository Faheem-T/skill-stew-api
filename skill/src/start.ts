import { app } from "./app";
import { connectDB } from "./config/mongoConnection";
import { ENV } from "./utils/dotenv";
import { initializeMessageQueue } from "./utils/initMessageQueue";
import { logger } from "./utils/logger";

async function start() {
  try {
    await connectDB();
    await initializeMessageQueue();
    app.listen(ENV.PORT);
    logger.info(`Listening on port ${ENV.PORT}`);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

start();
