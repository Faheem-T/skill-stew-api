import { createApp } from "./app/createApp";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

process.on("uncaughtException", (err, origin) => {
  logger.error("Critical application error. Exiting process with status code 1.", {
    err,
    origin,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection. Exiting process with status code 1.", {
    reason,
  });
  process.exit(1);
});

const app = createApp(ENV);
const port = Number(ENV.PORT ?? 3000);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
