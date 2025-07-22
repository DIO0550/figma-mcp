import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Logger as LoggerInterface } from './logger.interface.js';
import type { LogLevel } from './logger.interface.js';
import { ConsoleLogger } from './console-logger.js';
import { McpLogger } from './mcp-logger.js';

export { LogLevel } from './logger.interface.js';
export type { Logger as LoggerInterface } from './logger.interface.js';

// ロガータイプの定義
export type LoggerType =
  | { type: 'console'; level?: LogLevel }
  | { type: 'mcp'; server: Server; level?: LogLevel };

// 拡張されたLoggerインターフェース
export interface ExtendedLogger extends LoggerInterface {
  init(config: LoggerType): void;
}

// シングルトンインスタンス（デフォルトはConsoleLogger）
let instance: LoggerInterface = new ConsoleLogger();

// Loggerオブジェクト
export const Logger: ExtendedLogger = {
  debug: (message: string, data?: unknown): void => instance.debug(message, data),
  info: (message: string, data?: unknown): void => instance.info(message, data),
  warn: (message: string, data?: unknown): void => instance.warn(message, data),
  error: (message: string, data?: unknown): void => instance.error(message, data),
  setLevel: (level: LogLevel): void => instance.setLevel(level),

  init: (config: LoggerType): void => {
    switch (config.type) {
      case 'console':
        instance = new ConsoleLogger();
        break;
      case 'mcp':
        instance = new McpLogger(config.server);
        break;
    }

    if (config.level === undefined) return;

    instance.setLevel(config.level);
  },
};

// グローバルlogger変数（互換性のため）
export const logger = Logger;
