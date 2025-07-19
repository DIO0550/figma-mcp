import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHttpClient } from './client';
import { createApiConfig } from './config';
import type { ApiConfig } from './config';

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
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const client = createHttpClient(config);
      const result = await client.get('/v1/files/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test',
        {
          headers: {
            'X-Figma-Token': 'test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test('URLSearchParamsを使用してクエリパラメータを追加できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
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
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const client = createHttpClient(config);
      const result = await client.post('/v1/files/test/comments', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test/comments',
        {
          method: 'POST',
          headers: {
            'X-Figma-Token': 'test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('エラーハンドリング', () => {
    test('404エラーの場合は適切なエラーメッセージを含むエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ err: 'File not found' }),
        headers: new Headers(),
      });

      const client = createHttpClient(config);

      await expect(client.get('/v1/files/invalid')).rejects.toThrow('File not found');
    });

    test('429エラーの場合はRetry-After情報を含むエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ err: 'Rate limit exceeded' }),
        headers: new Headers({
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '1704067200',
        }),
      });

      const client = createHttpClient(config);

      await expect(client.get('/v1/files/test')).rejects.toThrow(
        'Rate limit exceeded (Retry after 60 seconds)'
      );
    });

    test('JSON解析に失敗した場合はHTTPステータスメッセージを使用する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON'); },
        headers: new Headers(),
      });

      const client = createHttpClient(config);

      await expect(client.get('/v1/files/test')).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });
  });

  describe('レート制限情報', () => {
    test('レート制限ヘッダーからコンテキスト情報を更新する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
        headers: new Headers({
          'X-RateLimit-Remaining': '99',
          'X-RateLimit-Reset': '1704067200',
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
        json: async () => ({ err: 'Rate limit' }),
        headers: new Headers({
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '1704067200',
        }),
      });

      const client = createHttpClient(config);

      try {
        await client.get('/v1/files/test');
      } catch (error: any) {
        expect(error.rateLimitInfo).toEqual({
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
        json: async () => ({ data: 'test' }),
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
});