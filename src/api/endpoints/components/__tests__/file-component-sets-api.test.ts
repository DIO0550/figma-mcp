import { test, expect, vi } from 'vitest';
import { fileComponentSetsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { FileComponentSetsApiResponse } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('fileComponentSetsApiでコンポーネントセット一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
    const mockResponse: FileComponentSetsApiResponse = {
      meta: {
        componentSets: [
          {
            key: 'componentset-1',
            name: 'Button Set',
            description: 'A set of button components',
          },
        ],
      },
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/component_sets'
  );
  expect(result).toEqual(mockResponse);
});

test('fileComponentSetsApiで空のコンポーネントセット一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: FileComponentSetsApiResponse = {
    meta: {
      componentSets: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.meta.componentSets).toHaveLength(0);
});

test('fileComponentSetsApiで複数のコンポーネントセットを正しく取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
    const mockResponse: FileComponentSetsApiResponse = {
      meta: {
        componentSets: [
          {
            key: 'componentset-1',
            name: 'Button Set',
            description: 'Primary buttons',
          },
          {
            key: 'componentset-2',
            name: 'Input Set',
            description: 'Text inputs',
          },
        ],
      },
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.meta.componentSets).toHaveLength(2);
  expect(result.meta.componentSets[0].name).toBe('Button Set');
  expect(result.meta.componentSets[1].name).toBe('Input Set');
});

test('fileComponentSetsApiでエラーレスポンスを正しく処理できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: FileComponentSetsApiResponse = {
    meta: {
      componentSets: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY);

  expect(result.meta.componentSets).toHaveLength(0);
});

test('fileComponentSetsApiでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  await expect(fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('fileComponentSetsApiで認証エラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const authError = new Error('Unauthorized');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(authError);

  await expect(fileComponentSetsApi(mockHttpClient, TestData.FILE_KEY)).rejects.toThrow('Unauthorized');
});

test('fileComponentSetsApiで特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: FileComponentSetsApiResponse = {
    meta: { componentSets: [] },
  };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const specialFileKey = 'file:key/with-special@chars';
  await fileComponentSetsApi(mockHttpClient, specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/component_sets'
  );
});