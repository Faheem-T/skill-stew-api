import morgan from "morgan";
import { logger } from "../utils/logger";

const morganFormat = JSON.stringify({
  method: ":method",
  url: ":url",
  status: ":status",
  response_time: ":response-time",
  content_length: ":res[content-length]",
});

export const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(JSON.parse(message));
    },
  },
});
