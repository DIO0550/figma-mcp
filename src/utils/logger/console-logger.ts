import type { Logger } from './logger.interface.js';
import { LogLevel } from './logger.interface.js';

export class ConsoleLogger implements Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, data?: unknown): void {
    if (LogLevel.DEBUG >= this.level) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  info(message: string, data?: unknown): void {
    if (LogLevel.INFO >= this.level) {
      this.log(LogLevel.INFO, message, data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (LogLevel.WARN >= this.level) {
      this.log(LogLevel.WARN, message, data);
    }
  }

  error(message: string, data?: unknown): void {
    if (LogLevel.ERROR >= this.level) {
      this.log(LogLevel.ERROR, message, data);
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `${timestamp} [${LogLevel[level]}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(prefix, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, data ?? '');
        break;
    }
  }
}
