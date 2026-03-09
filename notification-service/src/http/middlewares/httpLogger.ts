import morgan from "morgan";
import { container } from "../../container";
import type { ILogger } from "../../application/ports/ILogger";
import { TYPES } from "../../constants/Types";

const logger = container.get<ILogger>(TYPES.Logger);

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
      logger.http(JSON.parse(message));
    },
  },
});
