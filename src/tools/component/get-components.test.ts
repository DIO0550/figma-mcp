import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';

describe('get-components', () => {
  let mockApiClient: FigmaApiClient;

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

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

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

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    
    await expect(tools.getComponents.execute({ fileKey })).rejects.toThrow('API Error: 404 Not Found');
  });

  test('analyzeMetadataオプションでメタデータを解析できる', async () => {
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
            name: 'Button/Primary/Large',
            description: 'Primary button component - Large size',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Components',
            },
          },
          {
            key: 'component-2',
            file_key: fileKey,
            node_id: '1:3',
            name: 'Button/Secondary/Medium',
            description: 'Secondary button component - Medium size',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Components',
            },
          },
        ],
      },
      analysis: {
        total_components: 2,
        categories: {
          'Button': 2,
        },
        naming_patterns: {
          'hierarchical': 2, // Button/Primary/Large
        },
        pages_distribution: {
          'Components': 2,
        },
        description_coverage: 1.0, // 100% have descriptions
      },
    };

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ 
      fileKey,
      analyzeMetadata: true 
    });

    // Assert
    expect(result.analysis).toBeDefined();
    expect(result.analysis?.total_components).toBe(2);
    expect(result.analysis?.categories['Button']).toBe(2);
    expect(result.analysis?.description_coverage).toBe(1.0);
  });

  test('organizeVariantsオプションでバリアント情報を整理できる', async () => {
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
            name: 'Button',
            description: 'Button component',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Components',
            },
            component_set_id: 'set-1',
          },
          {
            key: 'component-2',
            file_key: fileKey,
            node_id: '1:3',
            name: 'Button',
            description: 'Button component - variant',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Components',
            },
            component_set_id: 'set-1',
          },
          {
            key: 'component-3',
            file_key: fileKey,
            node_id: '1:4',
            name: 'Card',
            description: 'Card component',
            containing_frame: {
              page_id: 'page-1',
              page_name: 'Components',
            },
            component_set_id: 'set-2',
          },
        ],
      },
      variantSets: {
        'set-1': {
          name: 'Button',
          variants: ['component-1', 'component-2'],
          properties: {
            'size': ['small', 'medium', 'large'],
            'state': ['default', 'hover', 'pressed'],
            'type': ['primary', 'secondary'],
          },
        },
        'set-2': {
          name: 'Card',
          variants: ['component-3'],
          properties: {},
        },
      },
    };

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ 
      fileKey,
      organizeVariants: true 
    });

    // Assert
    expect(result.variantSets).toBeDefined();
    expect(result.variantSets?.['set-1'].name).toBe('Button');
    expect(result.variantSets?.['set-1'].variants).toHaveLength(2);
    expect(result.variantSets?.['set-1'].variants).toContain('component-1');
    expect(result.variantSets?.['set-1'].variants).toContain('component-2');
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

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ fileKey });

    // Assert
    expect(result.meta.components).toHaveLength(0);
  });
});