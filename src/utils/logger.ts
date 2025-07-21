// 新しいロガー実装への移行
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
export { Logger, LogLevel, logger } from './logger/index.js';

// 後方互換性のための再エクスポート
import { Logger as LoggerNamespace, LogLevel } from './logger/index.js';

// 初期化関数（後方互換性）
export function initLogger(server: Server, level: LogLevel = LogLevel.INFO): void {
  LoggerNamespace.init({ type: 'mcp', server, level });
}

// 従来のインターフェース（テスト互換性のため）
export interface LoggerOptions {
  level?: LogLevel;
  format?: 'text' | 'json';
  context?: Record<string, unknown>;
  filter?: (level: LogLevel, message: string, context?: unknown) => boolean;
  server?: Server;
}

export interface LegacyLogger {
  debug(message: string, context?: unknown): void;
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
  child(name: string, context?: unknown): LegacyLogger;
}

// 従来のcreateLogger（テスト互換性のため）
export function createLogger(options: LoggerOptions = {}): LegacyLogger {
  const {
    level = LogLevel.INFO,
    context: globalContext = {},
    filter,
  } = options;

  // MCPサーバーが指定されている場合
  if (options.server) {
    initLogger(options.server, options.level);
    // グローバルロガーのラッパーを返す
    return {
      debug: (message: string, context?: unknown) => LoggerNamespace.debug(message, context),
      info: (message: string, context?: unknown) => LoggerNamespace.info(message, context),
      warn: (message: string, context?: unknown) => LoggerNamespace.warn(message, context),
      error: (message: string, context?: unknown) => LoggerNamespace.error(message, context),
      child: (name: string) => ({
        debug: (message: string, context?: unknown) => LoggerNamespace.debug(`[${name}] ${message}`, context),
        info: (message: string, context?: unknown) => LoggerNamespace.info(`[${name}] ${message}`, context),
        warn: (message: string, context?: unknown) => LoggerNamespace.warn(`[${name}] ${message}`, context),
        error: (message: string, context?: unknown) => LoggerNamespace.error(`[${name}] ${message}`, context),
        child: (): LegacyLogger => { throw new Error('Nested child not supported'); },
      }),
    };
  }

  // ローカルロガー（テスト用）
  const log = (
    logLevel: LogLevel,
    message: string,
    context?: unknown,
    namespace?: string
  ): void => {
    if (logLevel < level) return;
    if (filter && !filter(logLevel, message, context)) return;

    const timestamp = new Date().toISOString();
    const namespacePart = namespace ? `[${namespace}] ` : '';
    const levelLabel = ['[DEBUG]', '[INFO]', '[WARN]', '[ERROR]', ''][logLevel];
    const prefix = `${timestamp} ${levelLabel} ${namespacePart}${message}`;
    
    const mergedContext = {
      ...globalContext,
      ...(context as Record<string, unknown> || {}),
    };
    
    switch (logLevel) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(prefix, mergedContext);
        break;
      case LogLevel.WARN:
        console.warn(prefix, mergedContext);
        break;
      case LogLevel.ERROR:
        console.error(prefix, mergedContext);
        break;
    }
  };

  const createLoggerInstance = (namespace?: string, extraContext?: unknown): LegacyLogger => {
    const instanceContext = extraContext
      ? { ...globalContext, ...(extraContext as Record<string, unknown>) }
      : globalContext;

    return {
      debug(message: string, context?: unknown): void {
        log(LogLevel.DEBUG, message, { ...instanceContext, ...(context as Record<string, unknown> || {}) }, namespace);
      },
      info(message: string, context?: unknown): void {
        log(LogLevel.INFO, message, { ...instanceContext, ...(context as Record<string, unknown> || {}) }, namespace);
      },
      warn(message: string, context?: unknown): void {
        log(LogLevel.WARN, message, { ...instanceContext, ...(context as Record<string, unknown> || {}) }, namespace);
      },
      error(message: string, context?: unknown): void {
        log(LogLevel.ERROR, message, { ...instanceContext, ...(context as Record<string, unknown> || {}) }, namespace);
      },
      child(name: string, context?: unknown): LegacyLogger {
        const childNamespace = namespace ? `${namespace}:${name}` : name;
        return createLoggerInstance(childNamespace, { ...instanceContext, ...(context as Record<string, unknown> || {}) });
      },
    };
  };

  return createLoggerInstance();
}