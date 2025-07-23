import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { ExportImagesResponse } from '../../types/api/responses/image-responses.js';

describe('export-images', () => {
  let mockApiClient: FigmaApiClient;

  beforeEach(() => {
    // APIクライアントのモック作成
    mockApiClient = {
      exportImages: vi.fn(),
    } as unknown as FigmaApiClient;
  });

  test('画像をエクスポートできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2', '3:4'];
    const format = 'png';
    const scale = 2;
    
    const mockResponse: ExportImagesResponse = {
      err: null,
      images: {
        '1:2': 'https://figma-export.com/image1.png',
        '3:4': 'https://figma-export.com/image2.png',
      },
    };

    (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    const result = await tools.exportImages.execute({ fileKey, ids, format, scale });

    // Assert
    expect(mockApiClient.exportImages).toHaveBeenCalledWith(fileKey, { ids, format, scale });
    expect(result).toEqual(mockResponse);
    expect(Object.keys(result.images)).toHaveLength(2);
  });

  test('デフォルトのフォーマット（png）でエクスポートできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2'];
    
    const mockResponse: ExportImagesResponse = {
      err: null,
      images: {
        '1:2': 'https://figma-export.com/image1.png',
      },
    };

    (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    const result = await tools.exportImages.execute({ fileKey, ids });

    // Assert
    expect(mockApiClient.exportImages).toHaveBeenCalledWith(fileKey, { ids });
    expect(result.images['1:2']).toBeTruthy();
  });

  test('SVGフォーマットでエクスポートできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2'];
    const format = 'svg';
    
    const mockResponse: ExportImagesResponse = {
      err: null,
      images: {
        '1:2': 'https://figma-export.com/image1.svg',
      },
    };

    (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    const result = await tools.exportImages.execute({ fileKey, ids, format });

    // Assert
    expect(mockApiClient.exportImages).toHaveBeenCalledWith(fileKey, { ids, format });
    expect(result.images['1:2']).toContain('.svg');
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2'];
    const mockError = new Error('API Error: 400 Bad Request');

    (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    
    await expect(tools.exportImages.execute({ fileKey, ids })).rejects.toThrow('API Error: 400 Bad Request');
  });

  test('エラーレスポンスを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2'];
    
    const mockResponse: ExportImagesResponse = {
      err: 'Invalid node ID',
      images: {},
    };

    (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    const result = await tools.exportImages.execute({ fileKey, ids });

    // Assert
    expect(result.err).toBe('Invalid node ID');
    expect(Object.keys(result.images)).toHaveLength(0);
  });

  test('複数のスケールでエクスポートできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const ids = ['1:2'];
    const format = 'png';
    const scales = [1, 2, 3];
    
    const mockResponses = scales.map(scale => ({
      err: null,
      images: {
        '1:2': `https://figma-export.com/image1@${scale}x.png`,
      },
    }));

    // Act
    const { createImageTools } = await import('./index.js');
    const tools = createImageTools(mockApiClient);
    
    for (let i = 0; i < scales.length; i++) {
      (mockApiClient.exportImages as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponses[i]);
      const result = await tools.exportImages.execute({ fileKey, ids, format, scale: scales[i] });
      
      // Assert
      expect(result.images['1:2']).toContain(`@${scales[i]}x`);
    }
  });
});