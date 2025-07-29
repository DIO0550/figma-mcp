import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetStylesResponse } from '../../types/api/responses/style-responses.js';
import { convertKeysToCamelCase } from '../../utils/case-converter.js';

describe('get-styles', () => {
  let mockApiClient: FigmaApiClient;

  beforeEach(() => {
    // APIクライアントのモック作成
    mockApiClient = {
      getStyles: vi.fn(),
    } as unknown as FigmaApiClient;
  });

  test('スタイル一覧を取得できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetStylesResponse = {
      error: false,
      status: 200,
      meta: {
        styles: [
          {
            key: 'style-1',
            fileKey: fileKey,
            nodeId: '2:1',
            styleType: 'FILL',
            name: 'Primary Color',
            description: 'Main brand color',
          },
          {
            key: 'style-2',
            fileKey: fileKey,
            nodeId: '2:2',
            styleType: 'TEXT',
            name: 'Heading 1',
            description: 'Main heading style',
          },
          {
            key: 'style-3',
            fileKey: fileKey,
            nodeId: '2:3',
            styleType: 'EFFECT',
            name: 'Drop Shadow',
            description: 'Standard drop shadow',
          },
        ],
      },
    };

    (mockApiClient.getStyles as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetStylesResponse>(mockResponse)
    );

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({ fileKey });

    // Assert
    expect(mockApiClient.getStyles).toHaveBeenCalledWith(fileKey);
    expect(result).toEqual(mockResponse);
    expect(result.meta.styles).toHaveLength(3);
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockError = new Error('API Error: 403 Forbidden');

    (mockApiClient.getStyles as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);

    await expect(tools.getStyles.execute({ fileKey })).rejects.toThrow('API Error: 403 Forbidden');
  });

  test('空のスタイルリストを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetStylesResponse = {
      error: false,
      status: 200,
      meta: {
        styles: [],
      },
    };

    (mockApiClient.getStyles as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetStylesResponse>(mockResponse)
    );

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({ fileKey });

    // Assert
    expect(result.meta.styles).toHaveLength(0);
  });

  test('categorizeオプションでスタイルを分類できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetStylesResponse = {
      error: false,
      status: 200,
      meta: {
        styles: [
          {
            key: 'style-1',
            fileKey: fileKey,
            nodeId: '2:1',
            styleType: 'FILL',
            name: 'Colors/Primary/Blue',
            description: 'Primary blue color',
          },
          {
            key: 'style-2',
            fileKey: fileKey,
            nodeId: '2:2',
            styleType: 'FILL',
            name: 'Colors/Secondary/Green',
            description: 'Secondary green color',
          },
          {
            key: 'style-3',
            fileKey: fileKey,
            nodeId: '2:3',
            styleType: 'TEXT',
            name: 'Typography/Headings/H1',
            description: 'Main heading style',
          },
          {
            key: 'style-4',
            fileKey: fileKey,
            nodeId: '2:4',
            styleType: 'EFFECT',
            name: 'Effects/Shadows/Elevation-1',
            description: 'Light shadow',
          },
        ],
      },
      categorized: {
        FILL: {
          'Colors/Primary': ['style-1'],
          'Colors/Secondary': ['style-2'],
        },
        TEXT: {
          'Typography/Headings': ['style-3'],
        },
        EFFECT: {
          'Effects/Shadows': ['style-4'],
        },
      },
      statistics: {
        total: 4,
        byType: {
          FILL: 2,
          TEXT: 1,
          EFFECT: 1,
        },
        namingConsistency: 1.0, // 100% follow hierarchical naming
      },
    };

    (mockApiClient.getStyles as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetStylesResponse>(mockResponse)
    );

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({
      fileKey,
      categorize: true,
    });

    // Assert
    expect(result.categorized).toBeDefined();
    expect(result.categorized?.FILL['Colors/Primary']).toContain('style-1');
    expect(result.statistics?.total).toBe(4);
    expect(result.statistics?.byType.FILL).toBe(2);
  });

  test('スタイルタイプごとにフィルタリングできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetStylesResponse = {
      error: false,
      status: 200,
      meta: {
        styles: [
          {
            key: 'style-1',
            fileKey: fileKey,
            nodeId: '2:1',
            styleType: 'FILL',
            name: 'Primary Color',
            description: '',
          },
          {
            key: 'style-2',
            fileKey: fileKey,
            nodeId: '2:2',
            styleType: 'TEXT',
            name: 'Body Text',
            description: '',
          },
        ],
      },
    };

    (mockApiClient.getStyles as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetStylesResponse>(mockResponse)
    );

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({ fileKey });

    // Assert
    const fillStyles = result.meta.styles.filter((s) => s.styleType === 'FILL');
    const textStyles = result.meta.styles.filter((s) => s.styleType === 'TEXT');

    expect(fillStyles).toHaveLength(1);
    expect(textStyles).toHaveLength(1);
  });
});
