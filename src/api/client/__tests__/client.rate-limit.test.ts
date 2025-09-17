import { test, expect, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createApiConfig } from '../../config';
import { Headers as HeaderNames } from '../../../constants';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// HttpClient - レート制限管理テスト

test('レート制限ヘッダーからコンテキスト情報を正しく更新する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '99',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo).toEqual({
    remaining: 99,
    reset: new Date('2024-01-01T00:00:00Z'),
  });
});

test('複数のリクエストでレート制限情報が更新される', async () => {
  const config = createApiConfig('test-token');
  const client = createHttpClient(config);

  // 1回目のリクエスト
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test1' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '100',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });
  await client.get('/v1/files/test1');

  let context = client.getContext();
  expect(context.rateLimitInfo?.remaining).toBe(100);

  // 2回目のリクエスト
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test2' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '99',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });
  await client.get('/v1/files/test2');

  context = client.getContext();
  expect(context.rateLimitInfo?.remaining).toBe(99);
});

test('レート制限ヘッダーが部分的に欠けている場合の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '50',
      // RATE_LIMIT_RESET は含まれていない
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo).toBeUndefined();
});

test('レート制限情報がない場合はコンテキストを更新しない', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers(), // レート制限ヘッダーなし
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo).toBeUndefined();
});

test('無効なレート制限値の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: 'invalid',
      [HeaderNames.RATE_LIMIT_RESET]: 'invalid',
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  // 無効な値の場合、NaNとInvalid Dateが設定されるか、undefinedとなる
  if (context.rateLimitInfo) {
    expect(Number.isNaN(context.rateLimitInfo.remaining)).toBe(true);
    expect(context.rateLimitInfo.reset.toString()).toBe('Invalid Date');
  } else {
    expect(context.rateLimitInfo).toBeUndefined();
  }
});

test('レート制限リセット時刻の正しい変換', async () => {
  const config = createApiConfig('test-token');
  const resetTimestamp = 1704067200; // 2024-01-01T00:00:00Z
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '0',
      [HeaderNames.RATE_LIMIT_RESET]: String(resetTimestamp),
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo?.reset).toEqual(new Date(resetTimestamp * 1000));
});

test('レート制限が0の時の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '0',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo).toEqual({
    remaining: 0,
    reset: new Date('2024-01-01T00:00:00Z'),
  });
});

test('POSTリクエストでもレート制限情報を更新する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ id: '123' }),
    headers: new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '98',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
    }),
  });

  const client = createHttpClient(config);
  await client.post('/v1/files/test/comments', { message: 'test' });

  const context = client.getContext();
  expect(context.rateLimitInfo).toEqual({
    remaining: 98,
    reset: new Date('2024-01-01T00:00:00Z'),
  });
});

test('大文字小文字を区別しないヘッダー名の処理', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers({
      'x-ratelimit-remaining': '50',
      'X-RATELIMIT-RESET': '1704067200',
    }),
  });

  const client = createHttpClient(config);
  await client.get('/v1/files/test');

  const context = client.getContext();
  expect(context.rateLimitInfo).toEqual({
    remaining: 50,
    reset: new Date('2024-01-01T00:00:00Z'),
  });
});

test('リクエスト毎にコンテキストが独立している', () => {
  const config = createApiConfig('test-token');
  const client1 = createHttpClient(config);
  const client2 = createHttpClient(config);

  const context1 = client1.getContext();
  const context2 = client2.getContext();

  // 各クライアントのコンテキストは独立している
  expect(context1).not.toBe(context2);
});

test('同一クライアントでコンテキストが保持される', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
    headers: new Headers(),
  });

  const client = createHttpClient(config);
  const initialContext = client.getContext();

  await client.get('/v1/files/test1');
  await client.get('/v1/files/test2');

  const finalContext = client.getContext();
  // 同じクライアントインスタンスなので同じコンテキスト
  expect(finalContext).toBe(initialContext);
});
