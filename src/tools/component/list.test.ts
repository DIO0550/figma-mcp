import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';
import { convertKeysToCamelCase } from '../../utils/case-converter.js';

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
            fileKey: fileKey,
            nodeId: '1:2',
            name: 'Button Component',
            description: 'Primary button component',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Page 1',
            },
            documentationLinks: [],
          },
          {
            key: 'component-2',
            fileKey: fileKey,
            nodeId: '1:3',
            name: 'Card Component',
            description: 'Card layout component',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Page 1',
            },
            documentationLinks: [],
          },
        ],
      },
    };

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetComponentsResponse>(mockResponse)
    );

    // Act
    // ここでget_componentsツールを呼び出す（まだ実装されていないのでエラーになるはず）
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ fileKey });

    // Assert
    expect(mockApiClient.getComponents).toHaveBeenCalledWith(fileKey);
    expect(result).toEqual(convertKeysToCamelCase<GetComponentsResponse>(mockResponse));
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockError = new Error('API Error: 404 Not Found');

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);

    await expect(tools.getComponents.execute({ fileKey })).rejects.toThrow(
      'API Error: 404 Not Found'
    );
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
            fileKey: fileKey,
            nodeId: '1:2',
            name: 'Button/Primary/Large',
            description: 'Primary button component - Large size',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Components',
            },
            documentationLinks: [],
          },
          {
            key: 'component-2',
            fileKey: fileKey,
            nodeId: '1:3',
            name: 'Button/Secondary/Medium',
            description: 'Secondary button component - Medium size',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Components',
            },
            documentationLinks: [],
          },
        ],
      },
      analysis: {
        totalComponents: 2,
        categories: {
          Button: 2,
        },
        namingPatterns: {
          hierarchical: 2, // Button/Primary/Large
        },
        pagesDistribution: {
          Components: 2,
        },
        descriptionCoverage: 1.0, // 100% have descriptions
      },
    };

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetComponentsResponse>(mockResponse)
    );

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({
      fileKey,
      analyzeMetadata: true,
    });

    // Assert
    expect(result.analysis).toBeDefined();
    expect(result.analysis?.totalComponents).toBe(2);
    expect(result.analysis?.categories['Button']).toBe(2);
    expect(result.analysis?.descriptionCoverage).toBe(1.0);
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
            fileKey: fileKey,
            nodeId: '1:2',
            name: 'Button',
            description: 'Button component',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Components',
            },
            componentSetId: 'set-1',
            documentationLinks: [],
          },
          {
            key: 'component-2',
            fileKey: fileKey,
            nodeId: '1:3',
            name: 'Button',
            description: 'Button component - variant',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Components',
            },
            componentSetId: 'set-1',
            documentationLinks: [],
          },
          {
            key: 'component-3',
            fileKey: fileKey,
            nodeId: '1:4',
            name: 'Card',
            description: 'Card component',
            containingFrame: {
              pageId: 'page-1',
              pageName: 'Components',
            },
            componentSetId: 'set-2',
            documentationLinks: [],
          },
        ],
      },
      variantSets: {
        'set-1': {
          name: 'Button',
          variants: ['component-1', 'component-2'],
          properties: {
            size: ['small', 'medium', 'large'],
            state: ['default', 'hover', 'pressed'],
            type: ['primary', 'secondary'],
          },
        },
        'set-2': {
          name: 'Card',
          variants: ['component-3'],
          properties: {},
        },
      },
    };

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetComponentsResponse>(mockResponse)
    );

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({
      fileKey,
      organizeVariants: true,
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

    (mockApiClient.getComponents as ReturnType<typeof vi.fn>).mockResolvedValue(
      convertKeysToCamelCase<GetComponentsResponse>(mockResponse)
    );

    // Act
    const { createComponentTools } = await import('./index.js');
    const tools = createComponentTools(mockApiClient);
    const result = await tools.getComponents.execute({ fileKey });

    // Assert
    expect(result.meta.components).toHaveLength(0);
  });
});
