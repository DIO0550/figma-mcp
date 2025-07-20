import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createGetFileTool } from './get-file.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { FigmaFile } from '../../types/api/responses/index.js';

describe('get-file tool', () => {
  let filesApi: FilesApi;
  let get_file: ReturnType<typeof createGetFileTool>;

  beforeEach(() => {
    filesApi = {
      getFile: vi.fn(),
      getFileNodes: vi.fn(),
    };
    get_file = createGetFileTool(filesApi);
  });

  test('ファイル基本情報を取得できる', async () => {
    const mockFile: FigmaFile = {
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      editorType: 'figma',
      thumbnailUrl: 'https://example.com/thumb.png',
      version: '123456789',
      document: {
        id: 'doc-id',
        name: 'Document',
        type: 'DOCUMENT',
        scrollBehavior: 'FIXED',
        children: [],
      },
      components: {},
      styles: {},
      mainFileKey: 'file-key',
      branches: [],
    };

    vi.spyOn(filesApi, 'getFile').mockResolvedValue(mockFile);

    const result = await get_file.handler({
      file_key: 'test-file-key',
    });

    expect(result).toEqual({
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      editorType: 'figma',
      thumbnailUrl: 'https://example.com/thumb.png',
      version: '123456789',
      documentName: 'Document',
      pagesCount: 0,
      componentsCount: 0,
      stylesCount: 0,
    });

    expect(filesApi.getFile).toHaveBeenCalledWith('test-file-key', {});
  });

  test('ブランチIDを指定してファイル情報を取得できる', async () => {
    const mockFile: FigmaFile = {
      name: 'Branch File',
      lastModified: '2024-01-01T00:00:00Z',
      editorType: 'figma',
      thumbnailUrl: 'https://example.com/thumb.png',
      version: '123456789',
      document: {
        id: 'doc-id',
        name: 'Document',
        type: 'DOCUMENT',
        scrollBehavior: 'FIXED',
        children: [],
      },
      components: {},
      styles: {},
      mainFileKey: 'file-key',
      branches: [],
    };

    vi.spyOn(filesApi, 'getFile').mockResolvedValue(mockFile);

    await get_file.handler({
      file_key: 'test-file-key',
      branch_data_id: 'branch-123',
    });

    expect(filesApi.getFile).toHaveBeenCalledWith('test-file-key', {
      branch_data_id: 'branch-123',
    });
  });

  test('エラーが発生した場合は適切にエラーを返す', async () => {
    vi.spyOn(filesApi, 'getFile').mockRejectedValue(
      new Error('API Error'),
    );

    await expect(
      get_file.handler({
        file_key: 'test-file-key',
      }),
    ).rejects.toThrow('API Error');
  });
});