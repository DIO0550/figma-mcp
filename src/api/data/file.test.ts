import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FileData } from './file.js';
import type { FigmaContext } from '../context.js';
import type { FigmaFile } from '../../types/api/responses/file-responses.js';

describe('FileData', () => {
  const mockContext: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  describe('インターフェース', () => {
    it('必要なプロパティを持つ', () => {
      const fileData: FileData = {
        key: 'test-file-key',
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://example.com/thumbnail.png',
        version: '123456789',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      expect(fileData.key).toBe('test-file-key');
      expect(fileData.name).toBe('Test File');
      expect(fileData.lastModified).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('FileData.fromResponse', () => {
    it('Figma APIレスポンスからFileDataを作成できる', () => {
      const response: FigmaFile = {
        name: 'Design System',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://figma.com/thumb.png',
        version: '987654321',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const fileData = FileData.fromResponse('file-key-123', response);

      expect(fileData.key).toBe('file-key-123');
      expect(fileData.name).toBe('Design System');
      expect(fileData.lastModified).toBe('2024-01-01T00:00:00Z');
      expect(fileData.version).toBe('987654321');
      expect(fileData.document).toEqual(response.document);
    });

    it('オプショナルなフィールドがない場合でも処理できる', () => {
      const minimalResponse: FigmaFile = {
        name: 'Minimal File',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: '',
        version: '123',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const fileData = FileData.fromResponse('minimal-key', minimalResponse);

      expect(fileData.key).toBe('minimal-key');
      expect(fileData.name).toBe('Minimal File');
      expect(fileData.thumbnailUrl).toBe('');
    });
  });

  describe('FileData.fetch', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('指定されたファイルキーでファイル情報を取得できる', async () => {
      const mockResponse: FigmaFile = {
        name: 'Fetched File',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://figma.com/fetched.png',
        version: '111111',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      // fetchをモック
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const fileData = await FileData.fetch(mockContext, 'test-file-key');

      expect(fileData.key).toBe('test-file-key');
      expect(fileData.name).toBe('Fetched File');
      expect(fileData.version).toBe('111111');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key',
        expect.objectContaining({
          method: 'GET',
          headers: mockContext.headers,
        })
      );
    });

    it('versionパラメータを指定できる', async () => {
      const mockResponse: FigmaFile = {
        name: 'Versioned File',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: '',
        version: '222222',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await FileData.fetch(mockContext, 'test-file-key', { version: '222222' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key?version=222222',
        expect.any(Object)
      );
    });

    it('geometryパラメータを指定できる', async () => {
      const mockResponse: FigmaFile = {
        name: 'File with Geometry',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: '',
        version: '333333',
        document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await FileData.fetch(mockContext, 'test-file-key', { geometry: 'paths' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key?geometry=paths',
        expect.any(Object)
      );
    });

    it('APIエラーの場合は例外を投げる', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        FileData.fetch(mockContext, 'non-existent-file')
      ).rejects.toThrow('Failed to fetch file: 404 Not Found');
    });
  });

  describe('FileData.fetchNodes', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('指定されたノードIDの詳細情報を取得できる', async () => {
      const mockResponse = {
        name: 'File',
        nodes: {
          '1:1': {
            document: {
              id: '1:1',
              name: 'Component Node',
              type: 'COMPONENT',
              children: [],
            },
            components: {},
            schemaVersion: 0,
            styles: {},
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1']);

      expect(result.nodes['1:1']).toBeDefined();
      expect(result.nodes['1:1'].document.name).toBe('Component Node');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1',
        expect.objectContaining({
          method: 'GET',
          headers: mockContext.headers,
        })
      );
    });

    it('複数のノードIDを指定できる', async () => {
      const mockResponse = {
        name: 'File',
        nodes: {
          '1:1': {
            document: { id: '1:1', name: 'Node 1', type: 'FRAME', children: [] },
            components: {},
            schemaVersion: 0,
            styles: {},
          },
          '2:2': {
            document: { id: '2:2', name: 'Node 2', type: 'FRAME', children: [] },
            components: {},
            schemaVersion: 0,
            styles: {},
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1', '2:2']);

      expect(Object.keys(result.nodes)).toHaveLength(2);
      expect(result.nodes['1:1'].document.name).toBe('Node 1');
      expect(result.nodes['2:2'].document.name).toBe('Node 2');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1%2C2%3A2',
        expect.any(Object)
      );
    });

    it('depthオプションを指定できる', async () => {
      const mockResponse = {
        name: 'File',
        nodes: {},
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1'], { depth: 2 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1&depth=2',
        expect.any(Object)
      );
    });

    it('geometryオプションを指定できる', async () => {
      const mockResponse = {
        name: 'File',
        nodes: {},
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1'], { geometry: 'paths' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1&geometry=paths',
        expect.any(Object)
      );
    });
  });

  describe('FileData.getPageNames', () => {
    it('ファイルからページ名のリストを取得できる', () => {
      const fileData: FileData = {
        key: 'test-key',
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '123',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            { id: '1:1', name: 'Page 1', type: 'CANVAS', children: [] },
            { id: '2:2', name: 'Page 2', type: 'CANVAS', children: [] },
            { id: '3:3', name: 'Frame', type: 'FRAME', children: [] }, // Not a page
          ],
        },
        components: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const pageNames = FileData.getPageNames(fileData);

      expect(pageNames).toEqual(['Page 1', 'Page 2']);
    });

    it('ページがない場合は空配列を返す', () => {
      const fileData: FileData = {
        key: 'test-key',
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '123',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [],
        },
        components: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const pageNames = FileData.getPageNames(fileData);

      expect(pageNames).toEqual([]);
    });
  });

  describe('FileData.findNodeById', () => {
    it('指定されたIDのノードを見つけることができる', () => {
      const fileData: FileData = {
        key: 'test-key',
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '123',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            {
              id: '1:1',
              name: 'Page 1',
              type: 'CANVAS',
              children: [
                {
                  id: '2:2',
                  name: 'Target Frame',
                  type: 'FRAME',
                  children: [],
                },
              ],
            },
          ],
        },
        components: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const node = FileData.findNodeById(fileData, '2:2');

      expect(node).toBeDefined();
      expect(node?.name).toBe('Target Frame');
      expect(node?.type).toBe('FRAME');
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const fileData: FileData = {
        key: 'test-key',
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '123',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [],
        },
        components: {},
        schemaVersion: 0,
        styles: {},
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      const node = FileData.findNodeById(fileData, 'non-existent');

      expect(node).toBeUndefined();
    });
  });
});