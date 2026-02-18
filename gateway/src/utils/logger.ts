import winston from "winston";
const { combine, timestamp, json, errors, colorize, prettyPrint } =
  winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json(),
    ...(process.env.NODE_ENV !== "production" ? [prettyPrint()] : []),
    colorize({ all: true }),
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: "gateway" },
});
