import { test, expect, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createApiConfig } from '../../config';
import { HttpStatus, Headers as HeaderNames } from '../../../constants';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// HttpClient - エラーハンドリングテスト

test('404エラー - ファイル未発見エラーを適切に処理する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.NOT_FOUND,
    statusText: 'Not Found',
    json: () => Promise.resolve({ err: 'File not found' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/invalid')).rejects.toThrow('File not found');
});

test('401エラー - 認証エラーを適切に処理する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.UNAUTHORIZED,
    statusText: 'Unauthorized',
    json: () => Promise.resolve({ err: 'Invalid access token' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Invalid access token');
});

test('403エラー - 権限エラーを適切に処理する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.FORBIDDEN,
    statusText: 'Forbidden',
    json: () => Promise.resolve({ err: 'Access denied' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Access denied');
});

test('429エラー - レート制限エラーをRetry-After情報付きで処理する', async () => {
  const config = createApiConfig('test-token');
  const retryAfter = 60;
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.TOO_MANY_REQUESTS,
    statusText: 'Too Many Requests',
    json: () => Promise.resolve({ err: 'Rate limit exceeded' }),
    headers: new Headers({
      [HeaderNames.RETRY_AFTER]: String(retryAfter),
      [HeaderNames.RATE_LIMIT_REMAINING]: '0',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow(
    `Rate limit exceeded (Retry after ${retryAfter} seconds)`
  );
});

test('429エラー - Retry-Afterヘッダーがない場合のデフォルト処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.TOO_MANY_REQUESTS,
    statusText: 'Too Many Requests',
    json: () => Promise.resolve({ err: 'Rate limit exceeded' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '0',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Rate limit exceeded');
});

test('500エラー - サーバーエラーを適切に処理する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    statusText: 'Internal Server Error',
    json: () => Promise.resolve({ err: 'Server error occurred' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Server error occurred');
});

test('503エラー - サービス利用不可エラーを処理する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.SERVICE_UNAVAILABLE,
    statusText: 'Service Unavailable',
    json: () => Promise.resolve({ err: 'Service temporarily unavailable' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Service temporarily unavailable');
});

test('JSONパースエラー - 無効なJSONレスポンスの処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    statusText: 'Internal Server Error',
    json: () => {
      throw new Error('Invalid JSON');
    },
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow(
    `HTTP ${HttpStatus.INTERNAL_SERVER_ERROR}: Internal Server Error`
  );
});

test('JSONパースエラー - 空のレスポンスボディ', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.BAD_REQUEST,
    statusText: 'Bad Request',
    json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow(
    `HTTP ${HttpStatus.BAD_REQUEST}: Bad Request`
  );
});

test('ネットワークエラー - fetch失敗の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockRejectedValueOnce(new Error('Network error: Failed to fetch'));

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Network error: Failed to fetch');
});

test('タイムアウトエラー - リクエストタイムアウトの処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockRejectedValueOnce(new Error('The operation was aborted'));

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('The operation was aborted');
});

test('DNS解決エラー - ホスト名解決失敗の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND api.figma.com'));

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('getaddrinfo ENOTFOUND api.figma.com');
});

test('接続拒否エラー - サーバー接続失敗の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('connect ECONNREFUSED');
});

test('エラーレスポンスでもレート制限情報を更新する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.TOO_MANY_REQUESTS,
    statusText: 'Too Many Requests',
    json: () => Promise.resolve({ err: 'Rate limit' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '0',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);

  try {
    await client.get('/v1/files/test');
  } catch (error) {
    const err = error as Error & { rateLimitInfo?: unknown };
    expect(err.rateLimitInfo).toEqual({
      remaining: 0,
      reset: new Date('2024-01-01T00:00:00Z'),
    });
  }
});

test('複数のエラー情報を含むエラーメッセージ', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: HttpStatus.BAD_REQUEST,
    statusText: 'Bad Request',
    json: () =>
      Promise.resolve({
        err: 'Invalid request',
        errors: [{ message: 'Invalid parameter: depth' }, { message: 'Missing file key' }],
      }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow('Invalid request');
});

test('予期しないステータスコードの処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 418, // I'm a teapot
    statusText: "I'm a teapot",
    json: () => Promise.resolve({}),
    headers: new Headers(),
  });

  const client = createHttpClient(config);

  await expect(client.get('/v1/files/test')).rejects.toThrow("HTTP 418: I'm a teapot");
});
