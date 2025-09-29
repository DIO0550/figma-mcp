import { test, expect, vi, beforeEach } from 'vitest';
import { GetFileTool } from '../info.js';
import { FigmaApiClient } from '../../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../../api/figma-api-client/index.js';
import type { GetFileApiResponse } from '../../../api/endpoints/file/index.js';

let apiClient: FigmaApiClientInterface;
let tool: GetFileTool;

beforeEach(() => {
  apiClient = {} as FigmaApiClientInterface;
  tool = GetFileTool.from(apiClient);
});

test('有効なファイルキーでファイル情報を取得すると基本情報と統計が返される', async () => {
  const mockFile: GetFileApiResponse = {
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

test('versionとplugin_dataオプションを指定するとAPIリクエストに正しく渡される', async () => {
  const mockFile: GetFileApiResponse = {
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

test('ファイル内のCANVASタイプのノードがページ数として正しくカウントされる', async () => {
  const mockFile: GetFileApiResponse = {
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
