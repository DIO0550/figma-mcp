import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createGetFileNodesTool } from './get-file-nodes.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { GetFileNodesResponse } from '../../types/api/responses/index.js';

describe('get-file-nodes tool', () => {
  let filesApi: FilesApi;
  let get_file_nodes: ReturnType<typeof createGetFileNodesTool>;

  beforeEach(() => {
    filesApi = {
      getFile: vi.fn(),
      getFileNodes: vi.fn(),
    };
    get_file_nodes = createGetFileNodesTool(filesApi);
  });

  test('指定したノードの情報を取得できる', async () => {
    const mockResponse: GetFileNodesResponse = {
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

    vi.spyOn(filesApi, 'getFileNodes').mockResolvedValue(mockResponse);

    const result = await get_file_nodes.execute({
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

    expect(filesApi.getFileNodes).toHaveBeenCalledWith('test-file-key', ['1:2'], {});
  });

  test('複数のノードを取得できる', async () => {
    const mockResponse: GetFileNodesResponse = {
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

    vi.spyOn(filesApi, 'getFileNodes').mockResolvedValue(mockResponse);

    const result = await get_file_nodes.execute({
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

  test('depthオプションが正しく渡される', async () => {
    const mockResponse: GetFileNodesResponse = {
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      version: '123456789',
      nodes: {},
    };

    vi.spyOn(filesApi, 'getFileNodes').mockResolvedValue(mockResponse);

    await get_file_nodes.execute({
      file_key: 'test-file-key',
      ids: ['1:2'],
      depth: 3,
    });

    expect(filesApi.getFileNodes).toHaveBeenCalledWith('test-file-key', ['1:2'], { depth: 3 });
  });

  test('ノードIDが空の場合はエラーになる', async () => {
    await expect(
      get_file_nodes.execute({
        file_key: 'test-file-key',
        ids: [],
      })
    ).rejects.toThrow('At least one node ID is required');
  });
});
