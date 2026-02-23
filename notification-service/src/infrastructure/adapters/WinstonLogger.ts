import { injectable } from "inversify";
import winston from "winston";
import type { ILogger } from "../../application/ports/ILogger";
const { combine, timestamp, json, errors, colorize, prettyPrint } =
  winston.format;

@injectable()
export class WinstonLogger implements ILogger {
  private _logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
      timestamp({
        format: () =>
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }),
      errors({ stack: true }),
      process.env.NODE_ENV === "production"
        ? json()
        : combine(prettyPrint(), colorize({ all: true })),
    ),
    transports: [new winston.transports.Console()],
    defaultMeta: { service: "notification-service" },
  });

  silly = (...args: any[]) => this._logger.silly(args[0], ...args.slice(1));
  debug = (...args: any[]) => this._logger.debug(args[0], ...args.slice(1));
  info = (...args: any[]) => this._logger.info(args[0], ...args.slice(1));
  warn = (...args: any[]) => this._logger.warn(args[0], ...args.slice(1));
  error = (...args: any[]) => this._logger.error(args[0], ...args.slice(1));
}
