import { test, expect, vi } from 'vitest';
import { createFilesApi } from '../index';
import type { HttpClient } from '../../../client';
import type { FigmaFile, GetFileOptions } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('createFilesApi.getFileでファイル情報を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
    const mockFile: FigmaFile = {
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [],
      },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: 'https://example.com/thumb.png',
      version: '123456',
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockFile);

  const filesApi = createFilesApi(mockHttpClient);
  const result = await filesApi.getFile(TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key',
    new URLSearchParams()
  );
  expect(result).toEqual(mockFile);
});

test('createFilesApi.getFileでオプションなしでファイル情報を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockFile = {} as FigmaFile;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('');
});

  test.each([
    {
      options: { version: '123' },
      expectedParams: 'version=123',
    },
    {
      options: { ids: ['1:1', '2:2'] },
      expectedParams: 'ids=1%3A1%2C2%3A2',
    },
    {
      options: { depth: 3 },
      expectedParams: 'depth=3',
    },
    {
      options: { geometry: 'paths' as const },
      expectedParams: 'geometry=paths',
    },
    {
      options: { pluginData: 'test-plugin' },
      expectedParams: 'plugin_data=test-plugin',
    },
    {
      options: { branchData: true },
      expectedParams: 'branch_data=true',
    },
])('createFilesApi.getFileでオプション$optionsを正しくパラメータ化する', async ({ options, expectedParams }) => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe(expectedParams);
});

test('createFilesApi.getFileで複数のオプションを組み合わせて使用できる', async () => {
  const mockHttpClient = createMockHttpClient();
    const options: GetFileOptions = {
      version: '123',
      ids: ['1:1', '2:2'],
      depth: 2,
      geometry: 'points',
      pluginData: 'my-plugin',
      branchData: false,
    };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  const paramString = calledParams?.toString() ?? '';

  expect(paramString).toContain('version=123');
  expect(paramString).toContain('ids=1%3A1%2C2%3A2');
  expect(paramString).toContain('depth=2');
  expect(paramString).toContain('geometry=points');
  expect(paramString).toContain('plugin_data=my-plugin');
  expect(paramString).toContain('branch_data=false');
});

test('createFilesApi.getFileでdepthが0の場合も正しくパラメータ化される', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, { depth: 0 });

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('depth=0');
});

test('createFilesApi.getFileでbranchDataがfalseの場合も正しくパラメータ化される', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, { branchData: false });

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('branch_data=false');
});

test('createFilesApi.getFileで空のidsが渡された場合、空文字列のパラメータになる', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, { ids: [] });

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('ids=');
});

test('createFilesApi.getFileで特殊文字を含むnode IDが適切にエンコードされる', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  await filesApi.getFile(TestData.FILE_KEY, { ids: ['1:1', 'I123:456', 'S789;012'] });

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('ids=1%3A1%2CI123%3A456%2CS789%3B012');
});

test('createFilesApi.getFileで無効なgeometry値が渡された場合でも処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

  const filesApi = createFilesApi(mockHttpClient);
  // @ts-expect-error - Testing invalid geometry value
  await filesApi.getFile(TestData.FILE_KEY, { geometry: 'invalid' });

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('geometry=invalid');
});

test('createFilesApi.getFileでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const filesApi = createFilesApi(mockHttpClient);

  await expect(filesApi.getFile(TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('createFilesApi.getFileでタイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  const filesApi = createFilesApi(mockHttpClient);

  await expect(filesApi.getFile(TestData.FILE_KEY)).rejects.toThrow('Request timeout');
});