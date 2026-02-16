import winston from "winston";
const { combine, timestamp, json, errors, colorize } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json(),
    colorize({ all: true }),
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: "gateway" },
});
