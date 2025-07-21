import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetStylesResponse } from '../../types/api/responses/style-responses.js';

describe('get-styles', () => {
  let mockApiClient: FigmaApiClient;
  let getStyles: any;

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
            file_key: fileKey,
            node_id: '2:1',
            style_type: 'FILL',
            name: 'Primary Color',
            description: 'Main brand color',
          },
          {
            key: 'style-2',
            file_key: fileKey,
            node_id: '2:2',
            style_type: 'TEXT',
            name: 'Heading 1',
            description: 'Main heading style',
          },
          {
            key: 'style-3',
            file_key: fileKey,
            node_id: '2:3',
            style_type: 'EFFECT',
            name: 'Drop Shadow',
            description: 'Standard drop shadow',
          },
        ],
      },
    };

    vi.mocked(mockApiClient.getStyles).mockResolvedValue(mockResponse);

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

    vi.mocked(mockApiClient.getStyles).mockRejectedValue(mockError);

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

    vi.mocked(mockApiClient.getStyles).mockResolvedValue(mockResponse);

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({ fileKey });

    // Assert
    expect(result.meta.styles).toHaveLength(0);
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
            file_key: fileKey,
            node_id: '2:1',
            style_type: 'FILL',
            name: 'Primary Color',
            description: '',
          },
          {
            key: 'style-2',
            file_key: fileKey,
            node_id: '2:2',
            style_type: 'TEXT',
            name: 'Body Text',
            description: '',
          },
        ],
      },
    };

    vi.mocked(mockApiClient.getStyles).mockResolvedValue(mockResponse);

    // Act
    const { createStyleTools } = await import('./index.js');
    const tools = createStyleTools(mockApiClient);
    const result = await tools.getStyles.execute({ fileKey });

    // Assert
    const fillStyles = result.meta.styles.filter(s => s.style_type === 'FILL');
    const textStyles = result.meta.styles.filter(s => s.style_type === 'TEXT');
    
    expect(fillStyles).toHaveLength(1);
    expect(textStyles).toHaveLength(1);
  });
});