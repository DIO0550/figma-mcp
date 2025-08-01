import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createFilesApi } from './files';
import type { HttpClient } from '../client';
import type { FigmaFile, GetFileOptions } from '../../types';
import { TestData } from '../../constants';

describe('createFilesApi', () => {
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn().mockImplementation(() => Promise.resolve()),
      post: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    vi.clearAllMocks();
  });

  describe('getFile', () => {
    test('ファイル情報を取得できる', async () => {
      const mockFile: FigmaFile = {
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [],
        },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://example.com/thumb.png',
        version: '123456',
        role: 'owner',
        editorType: 'figma',
        linkAccess: 'view',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockFile);

      const filesApi = createFilesApi(mockHttpClient);
      const result = await filesApi.getFile(TestData.FILE_KEY);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/files/test-file-key',
        new URLSearchParams()
      );
      expect(result).toEqual(mockFile);
    });

    test('オプションなしでファイル情報を取得できる', async () => {
      const mockFile = {} as FigmaFile;
      vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockFile);

      const filesApi = createFilesApi(mockHttpClient);
      await filesApi.getFile(TestData.FILE_KEY);

      const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
      expect(calledParams?.toString()).toBe('');
    });

    test.each([
      {
        options: { version: '123' },
        expectedParams: 'version=123',
      },
      {
        options: { ids: ['1:1', '2:2'] },
        expectedParams: 'ids=1%3A1%2C2%3A2',
      },
      {
        options: { depth: 3 },
        expectedParams: 'depth=3',
      },
      {
        options: { geometry: 'paths' as const },
        expectedParams: 'geometry=paths',
      },
      {
        options: { plugin_data: 'test-plugin' },
        expectedParams: 'plugin_data=test-plugin',
      },
      {
        options: { branch_data: true },
        expectedParams: 'branch_data=true',
      },
    ])('オプション$optionsを正しくパラメータ化する', async ({ options, expectedParams }) => {
      vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

      const filesApi = createFilesApi(mockHttpClient);
      await filesApi.getFile(TestData.FILE_KEY, options);

      const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
      expect(calledParams?.toString()).toBe(expectedParams);
    });

    test('複数のオプションを組み合わせて使用できる', async () => {
      const options: GetFileOptions = {
        version: '123',
        ids: ['1:1', '2:2'],
        depth: 2,
        geometry: 'points',
        plugin_data: 'my-plugin',
        branch_data: false,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

      const filesApi = createFilesApi(mockHttpClient);
      await filesApi.getFile(TestData.FILE_KEY, options);

      const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
      const paramString = calledParams?.toString() ?? '';

      expect(paramString).toContain('version=123');
      expect(paramString).toContain('ids=1%3A1%2C2%3A2');
      expect(paramString).toContain('depth=2');
      expect(paramString).toContain('geometry=points');
      expect(paramString).toContain('plugin_data=my-plugin');
      expect(paramString).toContain('branch_data=false');
    });

    test('depthが0の場合も正しくパラメータ化される', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

      const filesApi = createFilesApi(mockHttpClient);
      await filesApi.getFile(TestData.FILE_KEY, { depth: 0 });

      const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
      expect(calledParams?.toString()).toBe('depth=0');
    });

    test('branch_dataがfalseの場合も正しくパラメータ化される', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValueOnce({} as FigmaFile);

      const filesApi = createFilesApi(mockHttpClient);
      await filesApi.getFile(TestData.FILE_KEY, { branch_data: false });

      const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
      expect(calledParams?.toString()).toBe('branch_data=false');
    });
  });
});
