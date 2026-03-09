import winston, { Logger } from "winston";
import type { ILogger } from "../../application/ports/ILogger";

const { combine, timestamp, json, errors, colorize, prettyPrint } =
  winston.format;

export class WinstonLogger implements ILogger {
  private _logger: Logger;
  constructor() {
    // Overriding winston colors as http and info colors
    // are the same by default
    winston.addColors({
      error: "red",
      warn: "yellow",
      info: "green",
      http: "magenta",
      verbose: "cyan",
      debug: "blue",
      silly: "gray",
    });

    this._logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "silly",
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
      defaultMeta: { service: "es-proxy" },
    });
  }

  silly = (...args: any[]) => this._logger.silly(args[0], ...args.slice(1));
  http = (...args: any[]) => this._logger.http(args[0], ...args.slice(1));
  debug = (...args: any[]) => this._logger.debug(args[0], ...args.slice(1));
  info = (...args: any[]) => this._logger.info(args[0], ...args.slice(1));
  warn = (...args: any[]) => this._logger.warn(args[0], ...args.slice(1));
  error = (...args: any[]) => this._logger.error(args[0], ...args.slice(1));
}
