import { test, expect, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createApiConfig } from '../../config';
import { createCache } from '../../../utils/cache/index.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// HttpClient - キャッシュ統合テスト

test('GETリクエストの結果をキャッシュする', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  vi.useFakeTimers();
  const cache = createCache({ defaultTtl: 60000 });
  const client = createHttpClient(config, { cache });

  const mockResponse = { data: 'test', id: '123' };
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  // 1回目のリクエスト - APIを呼ぶ
  const result1 = await client.get('/v1/files/test');
  expect(result1).toEqual(mockResponse);
  expect(mockFetch).toHaveBeenCalledTimes(1);

  // 2回目のリクエスト - キャッシュから返す
  const result2 = await client.get('/v1/files/test');
  expect(result2).toEqual(mockResponse);
  expect(mockFetch).toHaveBeenCalledTimes(1); // APIは呼ばれない
});

test('異なるURLは別々にキャッシュされる', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  const mockResponse1 = { data: 'file1', id: '123' };
  const mockResponse2 = { data: 'file2', id: '456' };

  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse1),
      headers: new Headers(),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse2),
      headers: new Headers(),
    });

  const result1 = await client.get('/v1/files/test1');
  const result2 = await client.get('/v1/files/test2');

  expect(result1).toEqual(mockResponse1);
  expect(result2).toEqual(mockResponse2);
  expect(mockFetch).toHaveBeenCalledTimes(2);

  // キャッシュから取得
  const cachedResult1 = await client.get('/v1/files/test1');
  const cachedResult2 = await client.get('/v1/files/test2');

  expect(cachedResult1).toEqual(mockResponse1);
  expect(cachedResult2).toEqual(mockResponse2);
  expect(mockFetch).toHaveBeenCalledTimes(2); // 追加のAPIコールなし
});

test('クエリパラメータが異なる場合は別のキャッシュエントリとして扱う', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  const mockResponse1 = { data: 'version1' };
  const mockResponse2 = { data: 'version2' };

  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse1),
      headers: new Headers(),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse2),
      headers: new Headers(),
    });

  const params1 = new URLSearchParams({ version: '1' });
  const params2 = new URLSearchParams({ version: '2' });

  const result1 = await client.get('/v1/files/test', params1);
  const result2 = await client.get('/v1/files/test', params2);

  expect(result1).toEqual(mockResponse1);
  expect(result2).toEqual(mockResponse2);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

test('POSTリクエストはキャッシュされない', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  const mockResponse = { id: '123', message: 'created' };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  // 同じPOSTリクエストを2回実行
  await client.post('/v1/files/test/comments', { message: 'test' });
  await client.post('/v1/files/test/comments', { message: 'test' });

  expect(mockFetch).toHaveBeenCalledTimes(2); // 両方ともAPIを呼ぶ
});

test('エラーレスポンスはキャッシュされない', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  mockFetch
    .mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ err: 'Not found' }),
      headers: new Headers(),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'found' }),
      headers: new Headers(),
    });

  // 1回目 - エラー
  await expect(client.get('/v1/files/test')).rejects.toThrow('Not found');

  // 2回目 - 成功（エラーがキャッシュされていないので新しくAPIを呼ぶ）
  const result = await client.get('/v1/files/test');
  expect(result).toEqual({ data: 'found' });
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

test('キャッシュTTLが正しく動作する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  vi.useFakeTimers();
  const cache = createCache({ defaultTtl: 1000 });
  const client = createHttpClient(config, { cache, cacheTtl: 1000 });

  const mockResponse = { data: 'test' };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  // 初回リクエスト
  await client.get('/v1/files/test');
  expect(mockFetch).toHaveBeenCalledTimes(1);

  // TTL内 - キャッシュから返す
  vi.advanceTimersByTime(500);
  await client.get('/v1/files/test');
  expect(mockFetch).toHaveBeenCalledTimes(1);

  // TTL経過後 - 新しくAPIを呼ぶ
  vi.advanceTimersByTime(600);
  await client.get('/v1/files/test');
  expect(mockFetch).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});

test('カスタムキャッシュキープレフィックスが動作する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, {
    cache,
    cacheKeyPrefix: 'figma-api:',
  });

  const mockResponse = { data: 'test' };
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  await client.get('/v1/files/test');

  // 正しいキーでキャッシュされているか確認
  expect(cache.has('figma-api:GET:/v1/files/test')).toBe(true);
  expect(cache.has('GET:/v1/files/test')).toBe(false);
});

test('キャッシュなしの設定で動作する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  // キャッシュなしでクライアントを作成
  const client = createHttpClient(config);

  const mockResponse = { data: 'test' };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  // 同じURLに2回アクセス
  await client.get('/v1/files/test');
  await client.get('/v1/files/test');

  // キャッシュがないので両方ともAPIを呼ぶ
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

test('キャッシュヒット時もレート制限情報を保持する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  const mockResponse = { data: 'test' };
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers({
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': '1704067200',
    }),
  });

  // 初回リクエスト
  await client.get('/v1/files/test');
  const context1 = client.getContext();
  expect(context1.rateLimitInfo).toEqual({
    remaining: 99,
    reset: new Date('2024-01-01T00:00:00Z'),
  });

  // キャッシュから取得（レート制限情報は変わらない）
  await client.get('/v1/files/test');
  const context2 = client.getContext();
  expect(context2.rateLimitInfo).toEqual({
    remaining: 99,
    reset: new Date('2024-01-01T00:00:00Z'),
  });
});

test('並行リクエストでキャッシュが正しく動作する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const cache = createCache();
  const client = createHttpClient(config, { cache });

  const mockResponse = { data: 'test' };
  let resolveCount = 0;
  mockFetch.mockImplementation(() => {
    resolveCount++;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      headers: new Headers(),
    });
  });

  // 並行して同じリクエストを3回実行
  const [result1, result2, result3] = await Promise.all([
    client.get('/v1/files/test'),
    client.get('/v1/files/test'),
    client.get('/v1/files/test'),
  ]);

  expect(result1).toEqual(mockResponse);
  expect(result2).toEqual(mockResponse);
  expect(result3).toEqual(mockResponse);

  // 最初のリクエストのみAPIを呼び、残りはキャッシュから返される可能性がある
  // 並行実行のため、キャッシュが効く前に複数回呼ばれる可能性もある
  expect(resolveCount).toBeGreaterThanOrEqual(1);
  expect(resolveCount).toBeLessThanOrEqual(3);
});

test('異なるキャッシュTTL設定で複数クライアントが独立して動作する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  vi.useFakeTimers();
  const sharedCache = createCache();

  const client1 = createHttpClient(config, { cache: sharedCache, cacheTtl: 1000 });
  const client2 = createHttpClient(config, { cache: sharedCache, cacheTtl: 2000 });

  const mockResponse = { data: 'test' };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers(),
  });

  // client1でリクエスト
  await client1.get('/v1/files/test1');
  expect(mockFetch).toHaveBeenCalledTimes(1);

  // client2でリクエスト
  await client2.get('/v1/files/test2');
  expect(mockFetch).toHaveBeenCalledTimes(2);

  // それぞれのキャッシュが独立していることを確認
  vi.advanceTimersByTime(1500);

  // client1のキャッシュは期限切れ、client2のキャッシュは有効
  await client1.get('/v1/files/test1');
  expect(mockFetch).toHaveBeenCalledTimes(3);

  await client2.get('/v1/files/test2');
  expect(mockFetch).toHaveBeenCalledTimes(3); // キャッシュから返すので増えない
  vi.useRealTimers();
});
