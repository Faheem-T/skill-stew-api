import { app } from "./app";
import { connectDB } from "./infrastructure/config/mongoConnection";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";

process.on("uncaughtException", (err, origin) => {
  logger.error(
    "Critical application error. Exiting process with status code 1.",
    { err, origin },
  );
  process.exit(1);
});

try {
  await connectDB();
  app.listen(ENV.PORT);
  logger.info(`Listening on port ${ENV.PORT}`);
} catch (err) {
  logger.error(err);
  throw err;
}
