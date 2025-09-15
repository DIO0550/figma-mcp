import { test, expect, vi, beforeEach } from 'vitest';
import { GetFileNodesTool } from '../nodes.js';
import { FigmaApiClient } from '../../../api/figma-api-client.js';
import type { GetFileNodesApiResponse } from '../../../api/endpoints/file-nodes/index.js';
import { GetFileNodesArgsSchema } from '../get-file-nodes-args.js';

let apiClient: FigmaApiClient;
let tool: GetFileNodesTool;

beforeEach(() => {
  apiClient = {} as FigmaApiClient;
  tool = GetFileNodesTool.from(apiClient);
});

test('指定したファイルキーとノードIDでノード情報を取得すると配列で返される', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {
      '1:2': {
        document: {
          id: '1:2',
          name: 'Button',
          type: 'COMPONENT',
          visible: true,
        },
        components: {},
        styles: {},
      },
    },
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  const result = await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2'],
  });

  expect(result).toEqual({
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: [
      {
        id: '1:2',
        name: 'Button',
        type: 'COMPONENT',
        visible: true,
      },
    ],
  });

  expect(FigmaApiClient.getFileNodes).toHaveBeenCalledWith(apiClient, 'test-file-key', ['1:2'], {});
});

test('指定したファイルキーで複数ノードIDを指定すると全ノード情報が配列で返る', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {
      '1:2': {
        document: {
          id: '1:2',
          name: 'Button',
          type: 'COMPONENT',
          visible: true,
        },
        components: {},
        styles: {},
      },
      '3:4': {
        document: {
          id: '3:4',
          name: 'Card',
          type: 'FRAME',
          visible: true,
        },
        components: {},
        styles: {},
      },
    },
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  const result = await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2', '3:4'],
  });

  expect(result.nodes).toHaveLength(2);
  expect(result.nodes).toContainEqual({
    id: '1:2',
    name: 'Button',
    type: 'COMPONENT',
    visible: true,
  });
  expect(result.nodes).toContainEqual({
    id: '3:4',
    name: 'Card',
    type: 'FRAME',
    visible: true,
  });
});

test('指定したファイルキーとノードIDでdepthを指定するとAPIに正しく渡される', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {},
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2'],
    depth: 3,
  });

  expect(FigmaApiClient.getFileNodes).toHaveBeenCalledWith(apiClient, 'test-file-key', ['1:2'], {
    depth: 3,
  });
});

test('ファイルキーは指定しノードID配列が空だとバリデーションエラーになる', () => {
  // バリデーション関数を直接テスト
  expect(() => {
    GetFileNodesArgsSchema.parse({
      file_key: 'test-file-key',
      ids: [],
    });
  }).toThrow();
});

test('指定したファイルキーとノードIDでgeometry=pathsを指定するとAPIに正しく渡される', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {},
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2'],
    geometry: 'paths',
  });

  expect(FigmaApiClient.getFileNodes).toHaveBeenCalledWith(apiClient, 'test-file-key', ['1:2'], {
    geometry: 'paths',
  });
});

test('指定したファイルキーとノードIDでgeometry=pointsを指定するとAPIに正しく渡される', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {},
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2'],
    geometry: 'points',
  });

  expect(FigmaApiClient.getFileNodes).toHaveBeenCalledWith(apiClient, 'test-file-key', ['1:2'], {
    geometry: 'points',
  });
});

test('指定したファイルキーとノードIDでgeometryとdepthを同時指定すると両方がAPIに含まれる', async () => {
  const mockResponse: GetFileNodesApiResponse = {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    version: '123456789',
    nodes: {},
  };

  vi.spyOn(FigmaApiClient, 'getFileNodes').mockResolvedValue(mockResponse);

  await GetFileNodesTool.execute(tool, {
    file_key: 'test-file-key',
    ids: ['1:2'],
    depth: 2,
    geometry: 'paths',
  });

  expect(FigmaApiClient.getFileNodes).toHaveBeenCalledWith(apiClient, 'test-file-key', ['1:2'], {
    depth: 2,
    geometry: 'paths',
  });
});
