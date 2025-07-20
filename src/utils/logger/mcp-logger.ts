import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Logger } from './logger.interface.js';
import { LogLevel } from './logger.interface.js';

export class McpLogger implements Logger {
  private level: LogLevel = LogLevel.INFO;

  constructor(private server: Server) {}

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
    const levelMap = {
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warning',
      [LogLevel.ERROR]: 'error',
    } as const;

    const mcpLevel = levelMap[level as keyof typeof levelMap];
    if (!mcpLevel || level === LogLevel.OFF) return;

    const logData = data ? `${message} ${JSON.stringify(data)}` : message;

    this.server
      .sendLoggingMessage({
        level: mcpLevel,
        data: logData,
      })
      .catch(() => {
        // エラーは無視
      });
  }
}
