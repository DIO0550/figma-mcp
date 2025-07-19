import { describe, test, expect, vi } from 'vitest';
import {
  parseRateLimitHeaders,
  getRetryAfter,
  shouldRetry,
  withRetry,
} from './rate-limit';

describe('parseRateLimitHeaders', () => {
  test('レート制限ヘッダーがある場合はRateLimitInfoを返す', () => {
    const headers = new Headers({
      'X-RateLimit-Remaining': '100',
      'X-RateLimit-Reset': '1704067200', // 2024-01-01T00:00:00Z
    });

    const result = parseRateLimitHeaders(headers);

    expect(result).toEqual({
      remaining: 100,
      reset: new Date('2024-01-01T00:00:00Z'),
    });
  });

  test('レート制限ヘッダーがない場合はundefinedを返す', () => {
    const headers = new Headers();

    const result = parseRateLimitHeaders(headers);

    expect(result).toBeUndefined();
  });

  test('一部のヘッダーのみがある場合はundefinedを返す', () => {
    const headers = new Headers({
      'X-RateLimit-Remaining': '100',
    });

    const result = parseRateLimitHeaders(headers);

    expect(result).toBeUndefined();
  });
});

describe('getRetryAfter', () => {
  test('Retry-Afterヘッダーがある場合は数値を返す', () => {
    const headers = new Headers({
      'Retry-After': '60',
    });

    const result = getRetryAfter(headers);

    expect(result).toBe(60);
  });

  test('Retry-Afterヘッダーがない場合はundefinedを返す', () => {
    const headers = new Headers();

    const result = getRetryAfter(headers);

    expect(result).toBeUndefined();
  });
});

describe('shouldRetry', () => {
  test.each([
    { status: 429, expected: true, description: 'レート制限エラー(429)' },
    { status: 500, expected: true, description: 'サーバーエラー(500)' },
    { status: 502, expected: true, description: 'Bad Gateway(502)' },
    { status: 503, expected: true, description: 'Service Unavailable(503)' },
    { status: 400, expected: false, description: 'Bad Request(400)' },
    { status: 404, expected: false, description: 'Not Found(404)' },
  ])('$descriptionの場合は$expectedを返す', ({ status, expected }) => {
    const error = Object.assign(new Error(), { status });

    const result = shouldRetry(error);

    expect(result).toBe(expected);
  });

  test('statusプロパティがないエラーの場合はfalseを返す', () => {
    const error = new Error('Normal error');

    const result = shouldRetry(error);

    expect(result).toBe(false);
  });

  test('エラーでない値の場合はfalseを返す', () => {
    expect(shouldRetry(null)).toBe(false);
    expect(shouldRetry(undefined)).toBe(false);
    expect(shouldRetry('string')).toBe(false);
  });
});

describe('withRetry', () => {
  test('成功する関数は1回だけ実行される', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('リトライ可能なエラーは指定回数まで再実行される', async () => {
    const error = Object.assign(new Error('Server Error'), { status: 500 });
    const mockFn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const result = await withRetry(mockFn, 3, 10);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('リトライ不可能なエラーは即座に投げられる', async () => {
    const error = Object.assign(new Error('Not Found'), { status: 404 });
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(mockFn)).rejects.toThrow('Not Found');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('最大リトライ回数を超えたら最後のエラーを投げる', async () => {
    const error = Object.assign(new Error('Server Error'), { status: 500 });
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(mockFn, 3, 10)).rejects.toThrow('Server Error');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('エクスポネンシャルバックオフで遅延が増加する', async () => {
    const error = Object.assign(new Error('Server Error'), { status: 500 });
    const mockFn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    await withRetry(mockFn, 3, 100);

    // 1回目のリトライ: 100ms
    // 2回目のリトライ: 200ms
    expect(setTimeoutSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 100);
    expect(setTimeoutSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 200);

    setTimeoutSpy.mockRestore();
  });
});