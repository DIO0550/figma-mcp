import { test, expect, vi } from 'vitest';
import { getFileNodesApi, type GetFileNodesApiResponse } from '../index.js';
import type { HttpClient } from '../../../client/client.js';
import type { GetFileApiOptions } from '../../file/index.js';
import { TestData } from '../../../../constants/__test__/index.js';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('getFileNodesApiでノード情報を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    thumbnailUrl: 'https://example.com/thumb.png',
    version: '123456',
    nodes: {
      '1:1': {
        document: {
          id: '1:1',
          name: 'Node 1',
          type: 'FRAME',
          children: [],
        },
        components: {},
        styles: {},
      },
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const result = await getFileNodesApi(mockHttpClient, TestData.FILE_KEY, ['1:1']);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/nodes',
    expect.any(URLSearchParams)
  );

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('ids=1%3A1');
  expect(result).toEqual(mockResponse);
});

test('getFileNodesApiで複数のノードIDを指定できる', async () => {
  const mockHttpClient = createMockHttpClient();
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as GetFileNodesApiResponse);

  await getFileNodesApi(mockHttpClient, TestData.FILE_KEY, ['1:1', '2:2', '3:3']);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('ids=1%3A1%2C2%3A2%2C3%3A3');
});

test.each([
  {
    options: { version: '123' },
    expectedParams: 'ids=1%3A1&version=123',
  },
  {
    options: { depth: 3 },
    expectedParams: 'ids=1%3A1&depth=3',
  },
  {
    options: { geometry: 'paths' as const },
    expectedParams: 'ids=1%3A1&geometry=paths',
  },
  {
    options: { pluginData: 'test-plugin' },
    expectedParams: 'ids=1%3A1&plugin_data=test-plugin',
  },
  {
    options: { branchData: true },
    expectedParams: 'ids=1%3A1&branch_data=true',
  },
])(
  'getFileNodesApiでオプション$optionsを正しくパラメータ化する',
  async ({ options, expectedParams }) => {
    const mockHttpClient = createMockHttpClient();
    vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as GetFileNodesApiResponse);

    await getFileNodesApi(mockHttpClient, TestData.FILE_KEY, ['1:1'], options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toBe(expectedParams);
  }
);

test('getFileNodesApiで複数のオプションを組み合わせて使用できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const options: GetFileApiOptions = {
    version: '123',
    depth: 2,
    geometry: 'points',
    pluginData: 'my-plugin',
    branchData: false,
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as GetFileNodesApiResponse);

  await getFileNodesApi(mockHttpClient, TestData.FILE_KEY, ['1:1', '2:2'], options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  const paramString = calledParams?.toString() ?? '';

  expect(paramString).toContain('ids=1%3A1%2C2%3A2');
  expect(paramString).toContain('version=123');
  expect(paramString).toContain('depth=2');
  expect(paramString).toContain('geometry=points');
  expect(paramString).toContain('plugin_data=my-plugin');
  expect(paramString).toContain('branch_data=false');
});

test('getFileNodesApiでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  await expect(getFileNodesApi(mockHttpClient, TestData.FILE_KEY, ['1:1'])).rejects.toThrow(
    'Network error'
  );
});
