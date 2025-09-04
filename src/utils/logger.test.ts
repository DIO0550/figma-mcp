import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createConsoleLogger, LogLevel } from './logger.js';

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
      const logger = createConsoleLogger(LogLevel.DEBUG);

      logger.debug('デバッグメッセージ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[DEBUG\]/);
      expect(call[0]).toMatch(/デバッグメッセージ/);
    });

    it('情報メッセージをログ出力できる', () => {
      const logger = createConsoleLogger();

      logger.info('情報メッセージ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[INFO\]/);
      expect(call[0]).toMatch(/情報メッセージ/);
    });

    it('警告メッセージをログ出力できる', () => {
      const logger = createConsoleLogger();

      logger.warn('警告メッセージ');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const call = consoleWarnSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[WARN\]/);
      expect(call[0]).toMatch(/警告メッセージ/);
    });

    it('エラーメッセージをログ出力できる', () => {
      const logger = createConsoleLogger();

      logger.error('エラーメッセージ');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[ERROR\]/);
      expect(call[0]).toMatch(/エラーメッセージ/);
    });
  });

  describe('ログレベル制御', () => {
    it('ログレベルより低いメッセージは出力されない', () => {
      const logger = createConsoleLogger(LogLevel.WARN);

      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('ログレベルをOFFにすると何も出力されない', () => {
      const logger = createConsoleLogger(LogLevel.OFF);

      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('データ付きログ', () => {
    it('追加データと一緒にログ出力できる', () => {
      const logger = createConsoleLogger();
      const data = { userId: 123, action: 'login' };

      logger.info('ユーザーアクション', data);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/ユーザーアクション/);
      expect(call[1]).toEqual(data);
    });

    it('データがない場合は空文字列が出力される', () => {
      const logger = createConsoleLogger();

      logger.info('メッセージのみ');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/メッセージのみ/);
      expect(call[1]).toBe('');
    });
  });

  describe('ログレベル変更', () => {
    it('実行時にログレベルを変更できる', () => {
      const logger = createConsoleLogger(LogLevel.ERROR);

      logger.info('出力されない');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      logger.setLevel(LogLevel.INFO);
      logger.info('出力される');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
