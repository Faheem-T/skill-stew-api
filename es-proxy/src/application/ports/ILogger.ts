export interface ILogger {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  http: LogMethod;
  silly: LogMethod;
}

interface LogMethod {
  (message: string, ...meta: any[]): void;
  (message: any): void;
  (infoObject: object): void;
}
