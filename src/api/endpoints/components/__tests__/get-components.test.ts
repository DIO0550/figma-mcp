import { test, expect, vi } from 'vitest';
import { fileComponentsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { GetComponentsResponse } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('fileComponentsApiでコンポーネント一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
      error: false,
      meta: {
        components: [
          {
            key: 'component-1',
            name: 'Button Component',
            description: 'A button component',
            documentationLinks: [],
            containingFrame: {
              pageId: '0:0',
              pageName: 'Page 1',
            },
          },
        ],
      },
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentsApi(mockHttpClient, TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/components'
  );
  expect(result).toEqual(mockResponse);
});

test('fileComponentsApiで空のコンポーネント一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: false,
    meta: {
      components: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.meta.components).toHaveLength(0);
});

test('fileComponentsApiで複数のコンポーネントを正しく取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
    const mockResponse: GetComponentsResponse = {
      error: false,
      meta: {
        components: [
          {
            key: 'component-1',
            name: 'Button',
            description: 'Primary button',
            documentationLinks: [],
          },
          {
            key: 'component-2',
            name: 'Input',
            description: 'Text input field',
            documentationLinks: [],
          },
        ],
      },
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.meta.components).toHaveLength(2);
  expect(result.meta.components[0].name).toBe('Button');
  expect(result.meta.components[1].name).toBe('Input');
});

test('fileComponentsApiでエラーレスポンスを正しく処理できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: true,
    status: 403,
    meta: {
      components: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.error).toBe(true);
  expect(result.status).toBe(403);
});

test('fileComponentsApiでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  await expect(fileComponentsApi(mockHttpClient, TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('fileComponentsApiでタイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  await expect(fileComponentsApi(mockHttpClient, TestData.FILE_KEY)).rejects.toThrow('Request timeout');
});

test('fileComponentsApiで特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: false,
    meta: { components: [] },
  };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const specialFileKey = 'file:key/with-special@chars';
  await fileComponentsApi(mockHttpClient, specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/components'
  );
});