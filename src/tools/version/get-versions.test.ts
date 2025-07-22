import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';

describe('get-versions', () => {
  let mockApiClient: FigmaApiClient;
  let getVersions: any;

  beforeEach(() => {
    // APIクライアントのモック作成
    mockApiClient = {
      getVersions: vi.fn(),
    } as unknown as FigmaApiClient;
  });

  test('バージョン履歴を取得できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetVersionsResponse = {
      versions: [
        {
          id: 'version-3',
          created_at: '2024-01-03T00:00:00Z',
          label: 'Final Design',
          description: 'Ready for development',
          user: {
            id: 'user-1',
            handle: 'designer1',
            img_url: 'https://example.com/avatar1.png',
          },
        },
        {
          id: 'version-2',
          created_at: '2024-01-02T00:00:00Z',
          label: 'Design Review',
          description: 'Updated based on feedback',
          user: {
            id: 'user-1',
            handle: 'designer1',
            img_url: 'https://example.com/avatar1.png',
          },
        },
        {
          id: 'version-1',
          created_at: '2024-01-01T00:00:00Z',
          label: 'Initial Draft',
          description: 'First version of the design',
          user: {
            id: 'user-2',
            handle: 'designer2',
            img_url: 'https://example.com/avatar2.png',
          },
        },
      ],
    };

    vi.mocked(mockApiClient.getVersions).mockResolvedValue(mockResponse);

    // Act
    const { createVersionTools } = await import('./index.js');
    const tools = createVersionTools(mockApiClient);
    const result = await tools.getVersions.execute({ fileKey });

    // Assert
    expect(mockApiClient.getVersions).toHaveBeenCalledWith(fileKey);
    expect(result).toEqual(mockResponse);
    expect(result.versions).toHaveLength(3);
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockError = new Error('API Error: 404 Not Found');

    vi.mocked(mockApiClient.getVersions).mockRejectedValue(mockError);

    // Act & Assert
    const { createVersionTools } = await import('./index.js');
    const tools = createVersionTools(mockApiClient);
    
    await expect(tools.getVersions.execute({ fileKey })).rejects.toThrow('API Error: 404 Not Found');
  });

  test('空のバージョンリストを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetVersionsResponse = {
      versions: [],
    };

    vi.mocked(mockApiClient.getVersions).mockResolvedValue(mockResponse);

    // Act
    const { createVersionTools } = await import('./index.js');
    const tools = createVersionTools(mockApiClient);
    const result = await tools.getVersions.execute({ fileKey });

    // Assert
    expect(result.versions).toHaveLength(0);
  });

  test('バージョンが時系列順（新しい順）でソートされている', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetVersionsResponse = {
      versions: [
        {
          id: 'version-3',
          created_at: '2024-01-03T00:00:00Z',
          label: 'Version 3',
          description: '',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
        },
        {
          id: 'version-2',
          created_at: '2024-01-02T00:00:00Z',
          label: 'Version 2',
          description: '',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
        },
        {
          id: 'version-1',
          created_at: '2024-01-01T00:00:00Z',
          label: 'Version 1',
          description: '',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
        },
      ],
    };

    vi.mocked(mockApiClient.getVersions).mockResolvedValue(mockResponse);

    // Act
    const { createVersionTools } = await import('./index.js');
    const tools = createVersionTools(mockApiClient);
    const result = await tools.getVersions.execute({ fileKey });

    // Assert
    const dates = result.versions.map(v => new Date(v.created_at).getTime());
    const sortedDates = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sortedDates);
  });

  test('バージョンのラベルと説明を取得できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetVersionsResponse = {
      versions: [
        {
          id: 'version-1',
          created_at: '2024-01-01T00:00:00Z',
          label: 'Release v1.0',
          description: 'Production ready version with all features',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
        },
      ],
    };

    vi.mocked(mockApiClient.getVersions).mockResolvedValue(mockResponse);

    // Act
    const { createVersionTools } = await import('./index.js');
    const tools = createVersionTools(mockApiClient);
    const result = await tools.getVersions.execute({ fileKey });

    // Assert
    const version = result.versions[0];
    expect(version.label).toBe('Release v1.0');
    expect(version.description).toBe('Production ready version with all features');
  });
});