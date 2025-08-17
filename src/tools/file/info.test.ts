import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GetFileTool, type GetFileTool as GetFileToolType } from './info.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { FigmaFile } from '../../types/api/responses/index.js';

describe('info tool', () => {
  let filesApi: FilesApi;
  let tool: GetFileToolType;

  beforeEach(() => {
    filesApi = {
      getFile: vi.fn(),
      getFileNodes: vi.fn(),
    };
    tool = GetFileTool.from(filesApi);
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
        children: [],
      },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      role: 'editor',
      linkAccess: 'view',
    };

    vi.spyOn(filesApi, 'getFile').mockResolvedValue(mockFile);

    const result = await GetFileTool.execute(tool, {
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

  test('ブランチデータを含めてファイル情報を取得できる', async () => {
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
        children: [],
      },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      role: 'editor',
      linkAccess: 'view',
    };

    vi.spyOn(filesApi, 'getFile').mockResolvedValue(mockFile);

    await GetFileTool.execute(tool, {
      file_key: 'test-file-key',
      branch_data: true,
    });

    expect(filesApi.getFile).toHaveBeenCalledWith('test-file-key', {
      branchData: true,
    });
  });

  test('エラーが発生した場合は適切にエラーを返す', async () => {
    vi.spyOn(filesApi, 'getFile').mockRejectedValue(new Error('API Error'));

    await expect(
      GetFileTool.execute(tool, {
        file_key: 'test-file-key',
      })
    ).rejects.toThrow('API Error');
  });
});
