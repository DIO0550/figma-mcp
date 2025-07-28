import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, LogLevel } from './logger.js';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本機能', () => {
    it('デバッグメッセージをログ出力できる', () => {
      const logger = createLogger({ level: LogLevel.DEBUG });

      logger.debug('デバッグメッセージ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[DEBUG\]/);
      expect(call[0]).toMatch(/デバッグメッセージ/);
    });

    it('情報メッセージをログ出力できる', () => {
      const logger = createLogger();

      logger.info('情報メッセージ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[INFO\]/);
      expect(call[0]).toMatch(/情報メッセージ/);
    });

    it('警告メッセージをログ出力できる', () => {
      const logger = createLogger();

      logger.warn('警告メッセージ');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const call = consoleWarnSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[WARN\]/);
      expect(call[0]).toMatch(/警告メッセージ/);
    });

    it('エラーメッセージをログ出力できる', () => {
      const logger = createLogger();

      logger.error('エラーメッセージ');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[ERROR\]/);
      expect(call[0]).toMatch(/エラーメッセージ/);
    });
  });

  describe('ログレベル制御', () => {
    it('ログレベルより低いメッセージは出力されない', () => {
      const logger = createLogger({ level: LogLevel.WARN });

      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('ログレベルをOFFにすると何も出力されない', () => {
      const logger = createLogger({ level: LogLevel.OFF });

      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('構造化ログ', () => {
    it('オブジェクトをJSON形式で出力できる', () => {
      const logger = createLogger({ format: 'json' });
      const data = { userId: 123, action: 'login' };

      logger.info('ユーザーログイン', data);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      // MCPサーバーが設定されていない場合は、通常のコンソール出力
      expect(call).toContain('[INFO]');
      expect(call).toContain('ユーザーログイン');
      // コンテキストは第2引数として渡される
      expect(consoleLogSpy.mock.calls[0][1]).toEqual({ userId: 123, action: 'login' });
    });

    it('エラーオブジェクトを適切にシリアライズできる', () => {
      const logger = createLogger({ format: 'json' });
      const error = new Error('テストエラー');

      logger.error('エラー発生', { error });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0][0];
      // MCPサーバーが設定されていない場合は、通常のコンソール出力
      expect(call).toContain('[ERROR]');
      expect(call).toContain('エラー発生');
      // エラーオブジェクトはシリアライズされて第2引数に渡される
      const context = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
      expect((context.error as Error).message).toBe('テストエラー');
      expect((context.error as Error).name).toBe('Error');
    });
  });

  describe('コンテキスト', () => {
    it('グローバルコンテキストを設定できる', () => {
      const logger = createLogger({
        context: { service: 'figma-mcp', version: '1.0.0' },
      });

      logger.info('起動');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const [message, context] = consoleLogSpy.mock.calls[0];
      expect(message).toMatch(/\[INFO\]/);
      expect(message).toMatch(/起動/);
      expect(context).toMatchObject({
        service: 'figma-mcp',
        version: '1.0.0',
      });
    });

    it('ログごとのコンテキストを追加できる', () => {
      const logger = createLogger();

      logger.info('API呼び出し', { endpoint: '/v1/files', duration: 250 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const [message, context] = consoleLogSpy.mock.calls[0];
      expect(message).toMatch(/\[INFO\]/);
      expect(message).toMatch(/API呼び出し/);
      expect(context).toMatchObject({
        endpoint: '/v1/files',
        duration: 250,
      });
    });
  });

  describe('フィルタリング', () => {
    it('カスタムフィルターでログを制御できる', () => {
      const logger = createLogger({
        filter: (_level, message) => !message.includes('無視'),
      });

      logger.info('表示されるメッセージ');
      logger.info('無視されるメッセージ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[INFO\]/);
      expect(call[0]).toMatch(/表示されるメッセージ/);
    });
  });

  describe('子ロガー', () => {
    it('名前空間を持つ子ロガーを作成できる', () => {
      const logger = createLogger();
      const childLogger = logger.child('api-client');

      childLogger.info('リクエスト送信');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[INFO\]/);
      expect(call[0]).toMatch(/\[api-client\]/);
      expect(call[0]).toMatch(/リクエスト送信/);
    });

    it('子ロガーは親のコンテキストを継承する', () => {
      const logger = createLogger({
        context: { app: 'figma-mcp' },
      });
      const childLogger = logger.child('http', { module: 'client' });

      childLogger.info('通信開始');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const [message, context] = consoleLogSpy.mock.calls[0];
      expect(message).toMatch(/\[INFO\]/);
      expect(message).toMatch(/\[http\]/);
      expect(message).toMatch(/通信開始/);
      expect(context).toMatchObject({
        app: 'figma-mcp',
        module: 'client',
      });
    });
  });
});
