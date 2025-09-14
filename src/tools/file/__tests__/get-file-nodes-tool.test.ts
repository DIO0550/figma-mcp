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

test('指定したノードIDでファイルノード情報を取得するとノード情報配列が返される', async () => {
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

test('複数のノードIDを指定するとすべてのノード情報が配列で返される', async () => {
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

test('depthオプションを指定するとAPIリクエストに正しく渡される', async () => {
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

test('ノードID配列が空の場合はバリデーションエラーがスローされる', () => {
  // バリデーション関数を直接テスト
  expect(() => {
    GetFileNodesArgsSchema.parse({
      file_key: 'test-file-key',
      ids: [],
    });
  }).toThrow();
});

test('geometryオプションにpathsを指定するとAPIリクエストに正しく渡される', async () => {
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

test('geometryオプションにpointsを指定するとAPIリクエストに正しく渡される', async () => {
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

test('geometryとdepthオプションを同時に指定すると両方がAPIリクエストに含まれる', async () => {
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
