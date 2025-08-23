import { test, expect, vi } from 'vitest';
import { createComponentsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { GetComponentsResponse } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('createComponentsApi.getComponentsでコンポーネント一覧を取得できる', async () => {
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

  const componentsApi = createComponentsApi(mockHttpClient);
  const result = await componentsApi.getComponents(TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/components'
  );
  expect(result).toEqual(mockResponse);
});

test('createComponentsApi.getComponentsで空のコンポーネント一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: false,
    meta: {
      components: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const componentsApi = createComponentsApi(mockHttpClient);
  const result = await componentsApi.getComponents(TestData.FILE_KEY);

  expect(result.meta.components).toHaveLength(0);
});

test('createComponentsApi.getComponentsで複数のコンポーネントを正しく取得できる', async () => {
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

  const componentsApi = createComponentsApi(mockHttpClient);
  const result = await componentsApi.getComponents(TestData.FILE_KEY);

  expect(result.meta.components).toHaveLength(2);
  expect(result.meta.components[0].name).toBe('Button');
  expect(result.meta.components[1].name).toBe('Input');
});

test('createComponentsApi.getComponentsでエラーレスポンスを正しく処理できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: true,
    status: 403,
    meta: {
      components: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const componentsApi = createComponentsApi(mockHttpClient);
  const result = await componentsApi.getComponents(TestData.FILE_KEY);

  expect(result.error).toBe(true);
  expect(result.status).toBe(403);
});

test('createComponentsApi.getComponentsでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const componentsApi = createComponentsApi(mockHttpClient);

  await expect(componentsApi.getComponents(TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('createComponentsApi.getComponentsでタイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  const componentsApi = createComponentsApi(mockHttpClient);

  await expect(componentsApi.getComponents(TestData.FILE_KEY)).rejects.toThrow('Request timeout');
});

test('createComponentsApi.getComponentsで特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetComponentsResponse = {
    error: false,
    meta: { components: [] },
  };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const componentsApi = createComponentsApi(mockHttpClient);
  const specialFileKey = 'file:key/with-special@chars';
  await componentsApi.getComponents(specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/components'
  );
});