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

class LoggerFactory {
  private static instance: LoggerInterface = new ConsoleLogger();

  static init(config: LoggerType): void {
    switch (config.type) {
      case 'console':
        this.instance = new ConsoleLogger();
        break;
      case 'mcp':
        this.instance = new McpLogger(config.server);
        break;
    }

    if (config.level !== undefined) {
      this.instance.setLevel(config.level);
    }
  }

  static getLogger(): LoggerInterface {
    return this.instance;
  }
}

// エクスポートするLogger名前空間
export const Logger = {
  init: (config: LoggerType): void => {
    LoggerFactory.init(config);
  },

  debug: (message: string, data?: unknown): void => LoggerFactory.getLogger().debug(message, data),
  info: (message: string, data?: unknown): void => LoggerFactory.getLogger().info(message, data),
  warn: (message: string, data?: unknown): void => LoggerFactory.getLogger().warn(message, data),
  error: (message: string, data?: unknown): void => LoggerFactory.getLogger().error(message, data),
  setLevel: (level: LogLevel): void => LoggerFactory.getLogger().setLevel(level),
};

// グローバルlogger変数（互換性のため）
export const logger = Logger;
