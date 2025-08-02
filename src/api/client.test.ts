import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHttpClient } from './client';
import { createApiConfig } from './config';
import type { ApiConfig } from './config';
import { createCache } from '../utils/cache';
import { HttpStatus, Limits, Headers as HeaderNames, ContentType } from '../constants';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('createHttpClient', () => {
  let config: ApiConfig;

  beforeEach(() => {
    config = createApiConfig('test-token');
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get メソッド', () => {
    test('GETリクエストを送信できる', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const client = createHttpClient(config);
      const result = await client.get('/v1/files/test');

      expect(mockFetch).toHaveBeenCalledWith('https://api.figma.com/v1/files/test', {
        headers: {
          [HeaderNames.FIGMA_TOKEN]: 'test-token',
          [HeaderNames.CONTENT_TYPE]: ContentType.JSON,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    test('URLSearchParamsを使用してクエリパラメータを追加できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      });

      const client = createHttpClient(config);
      const params = new URLSearchParams({ version: '123', depth: '2' });
      await client.get('/v1/files/test', params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test?version=123&depth=2',
        expect.any(Object)
      );
    });
  });

  describe('post メソッド', () => {
    test('POSTリクエストを送信できる', async () => {
      const mockResponse = { id: '123', message: 'Created' };
      const requestBody = { message: 'Hello', client_meta: { x: 100, y: 200 } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const client = createHttpClient(config);
      const result = await client.post('/v1/files/test/comments', requestBody);

      expect(mockFetch).toHaveBeenCalledWith('https://api.figma.com/v1/files/test/comments', {
        method: 'POST',
        headers: {
          [HeaderNames.FIGMA_TOKEN]: 'test-token',
          [HeaderNames.CONTENT_TYPE]: ContentType.JSON,
        },
        body: JSON.stringify(requestBody),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('エラーハンドリング', () => {
    test('404エラーの場合は適切なエラーメッセージを含むエラーを投げる', async () => {
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

    test('429エラーの場合はRetry-After情報を含むエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatus.TOO_MANY_REQUESTS,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ err: 'Rate limit exceeded' }),
        headers: new Headers({
          [HeaderNames.RETRY_AFTER]: String(Limits.DEFAULT_RETRY_AFTER_SECONDS),
          [HeaderNames.RATE_LIMIT_REMAINING]: '0',
          [HeaderNames.RATE_LIMIT_RESET]: '1704067200',
        }),
      });

      const client = createHttpClient(config);

      await expect(client.get('/v1/files/test')).rejects.toThrow(
        `Rate limit exceeded (Retry after ${Limits.DEFAULT_RETRY_AFTER_SECONDS} seconds)`
      );
    });

    test('JSON解析に失敗した場合はHTTPステータスメッセージを使用する', async () => {
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

      await expect(client.get('/v1/files/test')).rejects.toThrow(`HTTP ${HttpStatus.INTERNAL_SERVER_ERROR}: Internal Server Error`);
    });
  });

  describe('レート制限情報', () => {
    test('レート制限ヘッダーからコンテキスト情報を更新する', async () => {
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

    test('エラーレスポンスでもレート制限情報を更新する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
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
        expect((error as Error & { rateLimitInfo?: unknown }).rateLimitInfo).toEqual({
          remaining: 0,
          reset: new Date('2024-01-01T00:00:00Z'),
        });
      }
    });
  });

  describe('カスタム設定', () => {
    test('カスタムベースURLを使用できる', async () => {
      const customConfig = createApiConfig('test-token', 'https://custom.figma.com');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      });

      const client = createHttpClient(customConfig);
      await client.get('/v1/files/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.figma.com/v1/files/test',
        expect.any(Object)
      );
    });
  });

  describe('キャッシュ統合', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('GETリクエストの結果をキャッシュする', async () => {
      const cache = createCache({ defaultTtl: 60000 });
      const client = createHttpClient(config, { cache });

      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      // 1回目のリクエスト
      const result1 = await client.get('/v1/files/test');
      expect(result1).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // 2回目のリクエスト（キャッシュから）
      const result2 = await client.get('/v1/files/test');
      expect(result2).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1); // fetchは呼ばれない
    });

    test('異なるURLは別々にキャッシュされる', async () => {
      const cache = createCache();
      const client = createHttpClient(config, { cache });

      const mockResponse1 = { data: 'test1' };
      const mockResponse2 = { data: 'test2' };

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
    });

    test('POSTリクエストはキャッシュされない', async () => {
      const cache = createCache();
      const client = createHttpClient(config, { cache });

      const mockResponse = { id: '123' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      await client.post('/v1/files/test/comments', { message: 'test' });
      await client.post('/v1/files/test/comments', { message: 'test' });

      expect(mockFetch).toHaveBeenCalledTimes(2); // 両方ともfetchが呼ばれる
    });

    test('エラーレスポンスはキャッシュされない', async () => {
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

      // 1回目（エラー）
      await expect(client.get('/v1/files/test')).rejects.toThrow();

      // 2回目（成功）
      const result = await client.get('/v1/files/test');
      expect(result).toEqual({ data: 'found' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('キャッシュのTTLが機能する', async () => {
      const cache = createCache({ defaultTtl: 1000 });
      const client = createHttpClient(config, { cache, cacheTtl: 1000 });

      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      // 1回目
      await client.get('/v1/files/test');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // TTL内
      vi.advanceTimersByTime(500);
      await client.get('/v1/files/test');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // TTL経過後
      vi.advanceTimersByTime(600);
      await client.get('/v1/files/test');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('cacheKeyPrefixでキャッシュキーをカスタマイズできる', async () => {
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

      // キャッシュが正しいキーで保存されているか確認
      expect(cache.has('figma-api:GET:/v1/files/test')).toBe(true);
    });
  });
});
