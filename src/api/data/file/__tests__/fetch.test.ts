import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FileData } from '../file.js';
import type { FigmaContext } from '../../../context.js';
import type { FigmaFile } from '../../../../types/api/responses/file-responses.js';

describe('FileData.fetch', () => {
  const mockContext: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

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