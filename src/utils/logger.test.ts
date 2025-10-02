/**
 * Logger機能のテスト
 * コンソール出力の動作、ログレベル制御、データ付きログ出力を検証
 */
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createConsoleLogger, LogLevel } from './logger.js';

let consoleLogSpy: ReturnType<typeof vi.spyOn> | undefined;
let consoleWarnSpy: ReturnType<typeof vi.spyOn> | undefined;
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

beforeEach(() => {
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('DEBUGレベルのlogger.debugでコンソールに[DEBUG]タグ付きメッセージが出力される', () => {
  const logger = createConsoleLogger(LogLevel.DEBUG);

  logger.debug('デバッグメッセージ');

  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  const call = consoleLogSpy.mock.calls[0];
  expect(call[0]).toMatch(/\[DEBUG\]/);
  expect(call[0]).toMatch(/デバッグメッセージ/);
});

test('logger.infoでコンソールに[INFO]タグ付きメッセージが出力される', () => {
  const logger = createConsoleLogger();

  logger.info('情報メッセージ');

  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  const call = consoleLogSpy.mock.calls[0];
  expect(call[0]).toMatch(/\[INFO\]/);
  expect(call[0]).toMatch(/情報メッセージ/);
});

test('logger.warnでconsole.warnに[WARN]タグ付きメッセージが出力される', () => {
  const logger = createConsoleLogger();

  logger.warn('警告メッセージ');

  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  const call = consoleWarnSpy.mock.calls[0];
  expect(call[0]).toMatch(/\[WARN\]/);
  expect(call[0]).toMatch(/警告メッセージ/);
});

test('logger.errorでconsole.errorに[ERROR]タグ付きメッセージが出力される', () => {
  const logger = createConsoleLogger();

  logger.error('エラーメッセージ');

  expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  const call = consoleErrorSpy.mock.calls[0];
  expect(call[0]).toMatch(/\[ERROR\]/);
  expect(call[0]).toMatch(/エラーメッセージ/);
});

test('WARNレベルに設定するとDEBUGとINFOメッセージは出力されない', () => {
  const logger = createConsoleLogger(LogLevel.WARN);

  logger.debug('デバッグ');
  logger.info('情報');
  logger.warn('警告');

  expect(consoleLogSpy).not.toHaveBeenCalled();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
});

test('OFFレベルに設定すると全てのログが出力されない', () => {
  const logger = createConsoleLogger(LogLevel.OFF);

  logger.debug('デバッグ');
  logger.info('情報');
  logger.warn('警告');
  logger.error('エラー');

  expect(consoleLogSpy).not.toHaveBeenCalled();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  expect(consoleErrorSpy).not.toHaveBeenCalled();
});

test('オブジェクトデータをメッセージと一緒に出力できる', () => {
  const logger = createConsoleLogger();
  const data = { userId: 123, action: 'login' };

  logger.info('ユーザーアクション', data);

  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  const call = consoleLogSpy.mock.calls[0];
  expect(call[0]).toMatch(/ユーザーアクション/);
  expect(call[1]).toEqual(data);
});

test('データ引数を省略すると空文字列が第2引数として出力される', () => {
  const logger = createConsoleLogger();

  logger.info('メッセージのみ');

  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  const call = consoleLogSpy.mock.calls[0];
  expect(call[0]).toMatch(/メッセージのみ/);
  expect(call[1]).toBe('');
});

test('setLevelで実行中にログレベルを変更できる', () => {
  const logger = createConsoleLogger(LogLevel.ERROR);

  logger.info('出力されない');
  expect(consoleLogSpy).not.toHaveBeenCalled();

  logger.setLevel(LogLevel.INFO);
  logger.info('出力される');
  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
});
