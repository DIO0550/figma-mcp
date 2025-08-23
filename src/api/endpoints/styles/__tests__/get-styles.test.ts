import { test, expect, vi } from 'vitest';
import { createStylesApi } from '../index';
import type { HttpClient } from '../../../client';
import type { GetStylesResponse } from '../../../../types';
import { TestData } from '../../../../constants';

test('createStylesApi.getStyles - スタイル一覧を取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: false,
    meta: {
      styles: [
        {
          key: 'style-1',
          fileKey: TestData.FILE_KEY,
          nodeId: '1:1',
          styleType: 'FILL',
          name: 'Primary Color',
          description: 'Main brand color',
        },
      ],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const result = await stylesApi.getStyles(TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/styles'
  );
  expect(result).toEqual(mockResponse);
});

test('createStylesApi.getStyles - 空のスタイル一覧を取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: false,
    meta: {
      styles: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const result = await stylesApi.getStyles(TestData.FILE_KEY);

  expect(result.meta.styles).toHaveLength(0);
});

test('createStylesApi.getStyles - 複数のスタイルタイプを正しく取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: false,
    meta: {
      styles: [
        {
          key: 'style-1',
          fileKey: TestData.FILE_KEY,
          nodeId: '1:1',
          styleType: 'FILL',
          name: 'Primary Fill',
          description: 'Primary fill color',
        },
        {
          key: 'style-2',
          fileKey: TestData.FILE_KEY,
          nodeId: '2:2',
          styleType: 'TEXT',
          name: 'Heading Style',
          description: 'Text style for headings',
        },
        {
          key: 'style-3',
          fileKey: TestData.FILE_KEY,
          nodeId: '3:3',
          styleType: 'EFFECT',
          name: 'Drop Shadow',
          description: 'Standard drop shadow',
        },
      ],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const result = await stylesApi.getStyles(TestData.FILE_KEY);

  expect(result.meta.styles).toHaveLength(3);
  expect(result.meta.styles[0].styleType).toBe('FILL');
  expect(result.meta.styles[1].styleType).toBe('TEXT');
  expect(result.meta.styles[2].styleType).toBe('EFFECT');
});

test('createStylesApi.getStyles - エラーレスポンスを正しく処理できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: true,
    status: 403,
    meta: {
      styles: [],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const result = await stylesApi.getStyles(TestData.FILE_KEY);

  expect(result.error).toBe(true);
  expect(result.status).toBe(403);
});

test('createStylesApi.getStyles - 説明がないスタイルも正しく取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: false,
    meta: {
      styles: [
        {
          key: 'style-1',
          fileKey: TestData.FILE_KEY,
          nodeId: '1:1',
          styleType: 'FILL',
          name: 'Unnamed Style',
          description: '',
        },
      ],
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const result = await stylesApi.getStyles(TestData.FILE_KEY);

  expect(result.meta.styles[0].description).toBe('');
});

test('createStylesApi.getStyles - HTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const stylesApi = createStylesApi(mockHttpClient);

  await expect(stylesApi.getStyles(TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('createStylesApi.getStyles - 認証エラーが適切に処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const authError = new Error('Unauthorized');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(authError);

  const stylesApi = createStylesApi(mockHttpClient);

  await expect(stylesApi.getStyles(TestData.FILE_KEY)).rejects.toThrow('Unauthorized');
});

test('createStylesApi.getStyles - 特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetStylesResponse = {
    error: false,
    meta: { styles: [] },
  };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const stylesApi = createStylesApi(mockHttpClient);
  const specialFileKey = 'file:key/with-special@chars';
  await stylesApi.getStyles(specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/styles'
  );
});

test('createStylesApi.getStyles - タイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  const stylesApi = createStylesApi(mockHttpClient);

  await expect(stylesApi.getStyles(TestData.FILE_KEY)).rejects.toThrow('Request timeout');
});