import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GetFileTool } from './info.js';
import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { FigmaFile } from '../../types/api/responses/index.js';

describe('info tool', () => {
  let apiClient: FigmaApiClient;
  let tool: GetFileTool;

  beforeEach(() => {
    apiClient = {} as FigmaApiClient;
    tool = GetFileTool.from(apiClient);
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

    vi.spyOn(FigmaApiClient, 'getFile').mockResolvedValue(mockFile);

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

    expect(FigmaApiClient.getFile).toHaveBeenCalledWith(apiClient, 'test-file-key', {});
  });

  test('オプションパラメータを渡せる', async () => {
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

    vi.spyOn(FigmaApiClient, 'getFile').mockResolvedValue(mockFile);

    await GetFileTool.execute(tool, {
      file_key: 'test-file-key',
      version: '123',
      plugin_data: 'my-plugin',
    });

    expect(FigmaApiClient.getFile).toHaveBeenCalledWith(apiClient, 'test-file-key', {
      version: '123',
      pluginData: 'my-plugin',
    });
  });

  test('ページ数を正しくカウントできる', async () => {
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
        children: [
          { id: 'page1', name: 'Page 1', type: 'CANVAS', children: [] },
          { id: 'page2', name: 'Page 2', type: 'CANVAS', children: [] },
          { id: 'other', name: 'Other', type: 'FRAME', children: [] },
        ],
      },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      role: 'editor',
      linkAccess: 'view',
    };

    vi.spyOn(FigmaApiClient, 'getFile').mockResolvedValue(mockFile);

    const result = await GetFileTool.execute(tool, {
      file_key: 'test-file-key',
    });

    expect(result.pagesCount).toBe(2);
  });
});
