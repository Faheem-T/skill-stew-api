import winston from "winston";

const { combine, timestamp, errors, json, prettyPrint, colorize } =
  winston.format;

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? json()
      : combine(prettyPrint(), colorize({ all: true })),
  ),
  transports: [new winston.transports.Console()],
});
