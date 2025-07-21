import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';

describe('get-components', () => {
  let mockApiClient: FigmaApiClient;
  let getComponents: any;

  beforeEach(() => {
    // APIクライアントのモック作成
    mockApiClient = {
      getComponents: vi.fn(),
    } as unknown as FigmaApiClient;
  });

  test('コンポーネント一覧を取得できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetComponentsResponse = {
      error: false,
      status: 200,
      meta: {
        components: [
          {
            key: 'component-1',
            file_key: fileKey,
            node_id: '1:2',
            name: 'Button Component',
            description: 'Primary button component',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Page 1',
            },
          },
          {
            key: 'component-2',
            file_key: fileKey,
            node_id: '1:3',
            name: 'Card Component',
            description: 'Card layout component',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Page 1',
            },
          },
        ],
      },
    };

    vi.mocked(mockApiClient.getComponents).mockResolvedValue(mockResponse);

    // Act
    // ここでget_componentsツールを呼び出す（まだ実装されていないのでエラーになるはず）
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ fileKey });

    // Assert
    expect(mockApiClient.getComponents).toHaveBeenCalledWith(fileKey);
    expect(result).toEqual(mockResponse);
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockError = new Error('API Error: 404 Not Found');

    vi.mocked(mockApiClient.getComponents).mockRejectedValue(mockError);

    // Act & Assert
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    
    await expect(tools.getComponents.execute({ fileKey })).rejects.toThrow('API Error: 404 Not Found');
  });

  test('空のコンポーネントリストを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetComponentsResponse = {
      error: false,
      status: 200,
      meta: {
        components: [],
      },
    };

    vi.mocked(mockApiClient.getComponents).mockResolvedValue(mockResponse);

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ fileKey });

    // Assert
    expect(result.meta.components).toHaveLength(0);
  });
});