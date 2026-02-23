export interface ILogger {
  warn: LogMethod;
  error: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  silly: LogMethod;
}

interface LogMethod {
  (message: string, ...meta: any[]): void;
  (message: any): void;
  (infoObject: object): void;
}
