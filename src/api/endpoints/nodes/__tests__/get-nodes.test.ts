import { test, expect, vi } from 'vitest';
import { getNodesApi, type GetNodesApiResponse, type GetNodesApiOptions } from '../index';
import type { HttpClient } from '../../../client';
import type { DeepSnakeCase } from '../../../../utils/type-transformers';
import { TestData } from '../../../../constants';

test('getNodesApi - ノード情報を取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetNodesApiResponse = {
    nodes: {
      '1:1': {
        document: {
          id: '1:1',
          name: 'Component',
          type: 'COMPONENT',
          children: [],
        },
        components: {},
        schemaVersion: 0,
      },
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
  };

  const result = await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/nodes',
    expect.any(URLSearchParams)
  );

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('ids=1%3A1');
  expect(result).toEqual(mockResponse);
});

test('getNodesApi - 複数のノードを取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetNodesApiResponse = {
    nodes: {
      '1:1': {
        document: {
          id: '1:1',
          name: 'Node 1',
          type: 'FRAME',
          children: [],
        },
        components: {},
        schemaVersion: 0,
      },
      '2:2': {
        document: {
          id: '2:2',
          name: 'Node 2',
          type: 'TEXT',
        },
        components: {},
        schemaVersion: 0,
      },
    },
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1', '2:2'],
  };

  const result = await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('ids=1%3A1%2C2%3A2');
  expect(Object.keys(result.nodes)).toHaveLength(2);
});

test('getNodesApi - バージョンオプションを指定して取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
    version: '789',
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('version=789');
});

test('getNodesApi - depthオプションを指定して取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
    depth: 3,
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('depth=3');
});

test('getNodesApi - geometryオプションを指定して取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
    geometry: 'paths',
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('geometry=paths');
});

test('getNodesApi - plugin_dataオプションを指定して取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
    plugin_data: 'my-plugin',
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('plugin_data=my-plugin');
});

test('getNodesApi - すべてのオプションを組み合わせて取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1', '2:2', '3:3'],
    version: '456',
    depth: 2,
    geometry: 'points',
    plugin_data: 'test-plugin',
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  const paramString = calledParams?.toString() ?? '';

  expect(paramString).toContain('ids=1%3A1%2C2%3A2%2C3%3A3');
  expect(paramString).toContain('version=456');
  expect(paramString).toContain('depth=2');
  expect(paramString).toContain('geometry=points');
  expect(paramString).toContain('plugin_data=test-plugin');
});

test('getNodesApi - depthが0の場合も正しくパラメータ化される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
    depth: 0,
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('depth=0');
});

test('getNodesApi - 空のidsでも処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: [],
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toBe('ids=');
});

test('getNodesApi - 特殊文字を含むnode IDが適切にエンコードされる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse = { nodes: {} } as GetNodesApiResponse;
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['I:123', 'S;456', '7:8'],
  };

  await getNodesApi(mockHttpClient, TestData.FILE_KEY, options);

  const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
  expect(calledParams?.toString()).toContain('ids=I%3A123%2CS%3B456%2C7%3A8');
});

test('getNodesApi - HTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
  };

  await expect(getNodesApi(mockHttpClient, TestData.FILE_KEY, options)).rejects.toThrow(
    'Network error'
  );
});

test('getNodesApi - タイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  const options: DeepSnakeCase<GetNodesApiOptions> = {
    ids: ['1:1'],
  };

  await expect(getNodesApi(mockHttpClient, TestData.FILE_KEY, options)).rejects.toThrow(
    'Request timeout'
  );
});
