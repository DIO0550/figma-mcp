import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Logger as LoggerImpl, LogLevel } from './logger/index.js';
import { ConsoleLogger } from './logger/console-logger.js';
import { McpLogger } from './logger/mcp-logger.js';
import type { Logger } from './logger/logger.interface.js';

// 既存のエクスポート（グローバルシングルトン）
export { Logger, LogLevel, logger } from './logger/index.js';
export type { Logger as LoggerInterface } from './logger/logger.interface.js';

// ロガーファクトリのオプション
export type LoggerOptions =
  | { type: 'console'; level?: LogLevel }
  | { type: 'mcp'; server: Server; level?: LogLevel };

// ファクトリ関数: オプションに基づいて適切なロガーを作成
export function createLogger(options: LoggerOptions): Logger {
  let logger: Logger;

  switch (options.type) {
    case 'console':
      logger = new ConsoleLogger();
      break;
    case 'mcp':
      logger = new McpLogger(options.server);
      break;
  }

  if (options.level !== undefined) {
    logger.setLevel(options.level);
  }

  return logger;
}

// MCPサーバー用のグローバルシングルトンの初期化
export function initMcpLogger(server: Server, level: LogLevel = LogLevel.INFO): void {
  LoggerImpl.init({ type: 'mcp', server, level });
}

// ConsoleLoggerの簡易作成（テストおよび開発用）
export function createConsoleLogger(level: LogLevel = LogLevel.INFO): Logger {
  return createLogger({ type: 'console', level });
}
