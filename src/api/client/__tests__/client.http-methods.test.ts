import { test, expect, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createApiConfig } from '../../config';
import { Headers as HeaderNames, ContentType } from '../../../constants';

const mockFetch = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
global.fetch = mockFetch as unknown as typeof fetch;

const createMockResponse = <T>(body: T, init: ResponseInit = {}): Response => {
  const responseInit: ResponseInit = {
    status: 200,
    headers: new Headers(),
    ...init,
  };

  return new Response(JSON.stringify(body), responseInit);
};

// HttpClient - HTTPメソッドテスト

test('createHttpClient - 基本設定で正しくインスタンスが作成される', () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const client = createHttpClient(config);
  expect(client).toBeDefined();
  expect(client.get).toBeDefined();
  expect(client.post).toBeDefined();
  expect(client.getContext).toBeDefined();
});

test('GET - 成功時にJSONレスポンスを返す', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockReset();
  const mockResponse = { data: 'test', status: 'success' };
  mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

  const client = createHttpClient(config);
  const result = await client.get('/v1/files/test-file-key');

  expect(mockFetch).toHaveBeenCalledWith('https://api.figma.com/v1/files/test-file-key', {
    headers: {
      [HeaderNames.FIGMA_TOKEN]: 'test-token',
      [HeaderNames.CONTENT_TYPE]: ContentType.JSON,
    },
  });
  expect(result).toEqual(mockResponse);
});

test('GET - URLSearchParamsでクエリパラメータを追加する', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

  const client = createHttpClient(config);
  const params = new URLSearchParams({
    version: '123',
    depth: '2',
    geometry: 'paths',
  });
  await client.get('/v1/files/test', params);

  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.figma.com/v1/files/test?version=123&depth=2&geometry=paths',
    expect.any(Object)
  );
});

test('GET - 空のURLSearchParamsは無視される', async () => {
  const config = createApiConfig('test-token');
  mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

  const client = createHttpClient(config);
  const params = new URLSearchParams();
  await client.get('/v1/files/test', params);

  expect(mockFetch).toHaveBeenCalledWith('https://api.figma.com/v1/files/test', expect.any(Object));
});

test('POST - リクエストボディを正しくJSONシリアライズする', async () => {
  const config = createApiConfig('test-token');
  const mockResponse = { id: '123', message: 'Created' };
  const requestBody = {
    message: 'Hello',
    client_meta: { x: 100, y: 200 },
    comment_id: 'comment-456',
  };

  mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

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

test('POST - 空のボディでもリクエストを送信できる', async () => {
  const config = createApiConfig('test-token');
  const mockResponse = { success: true };
  mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

  const client = createHttpClient(config);
  const result = await client.post('/v1/files/test/refresh');

  expect(mockFetch).toHaveBeenCalledWith('https://api.figma.com/v1/files/test/refresh', {
    method: 'POST',
    headers: {
      [HeaderNames.FIGMA_TOKEN]: 'test-token',
      [HeaderNames.CONTENT_TYPE]: ContentType.JSON,
    },
  });
  expect(result).toEqual(mockResponse);
});

test('カスタムベースURLを使用できる', async () => {
  const customConfig = createApiConfig('test-token', 'https://custom.figma.com');
  mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

  const client = createHttpClient(customConfig);
  await client.get('/v1/files/test');

  expect(mockFetch).toHaveBeenCalledWith(
    'https://custom.figma.com/v1/files/test',
    expect.any(Object)
  );
});

test('異なるトークンで別々のクライアントを作成できる', async () => {
  const config1 = createApiConfig('token1');
  const config2 = createApiConfig('token2');

  mockFetch
    .mockResolvedValueOnce(createMockResponse({ data: 'test' }))
    .mockResolvedValueOnce(createMockResponse({ data: 'test' }));

  const client1 = createHttpClient(config1);
  const client2 = createHttpClient(config2);

  await client1.get('/v1/files/test');
  const lastCallToken1 = mockFetch.mock.calls.at(-1);
  expect(lastCallToken1).toBeDefined();
  const [, requestOptionsToken1] = lastCallToken1 as [string, RequestInit];
  const token1Headers = requestOptionsToken1.headers as Record<string, string>;
  expect(token1Headers[HeaderNames.FIGMA_TOKEN]).toBe('token1');

  await client2.get('/v1/files/test');
  const lastCallToken2 = mockFetch.mock.calls.at(-1);
  expect(lastCallToken2).toBeDefined();
  const [, requestOptionsToken2] = lastCallToken2 as [string, RequestInit];
  const token2Headers = requestOptionsToken2.headers as Record<string, string>;
  expect(token2Headers[HeaderNames.FIGMA_TOKEN]).toBe('token2');
});
