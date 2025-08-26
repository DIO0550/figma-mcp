import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImageExport } from '../image.js';
import type { FigmaContext } from '../../../context.js';
import type { ImageApiResponse } from '../../../../types/api/responses/image-responses.js';

describe('ImageExport.fetch', () => {
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

  it('画像エクスポートURLを取得できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {
        '1:1': 'https://s3.amazonaws.com/figma/image1.png',
        '2:2': 'https://s3.amazonaws.com/figma/image2.png',
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const imageExport = await ImageExport.fetch(mockContext, 'test-file-key', {
      nodeIds: ['1:1', '2:2'],
      format: 'PNG',
      scale: 2,
    });

    expect(imageExport.urls['1:1']).toBe('https://s3.amazonaws.com/figma/image1.png');
    expect(imageExport.urls['2:2']).toBe('https://s3.amazonaws.com/figma/image2.png');
    expect(imageExport.format).toBe('PNG');
    expect(imageExport.scale).toBe(2);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/images/test-file-key?ids=1%3A1%2C2%3A2&format=PNG&scale=2',
      expect.objectContaining({
        method: 'GET',
        headers: mockContext.headers,
      })
    );
  });

  it('SVGフォーマットを指定できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {
        '3:3': 'https://s3.amazonaws.com/figma/image.svg',
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await ImageExport.fetch(mockContext, 'test-file-key', { nodeIds: ['3:3'], format: 'SVG' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('format=SVG'),
      expect.any(Object)
    );
  });

  it('PDFフォーマットを指定できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {
        '4:4': 'https://s3.amazonaws.com/figma/document.pdf',
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await ImageExport.fetch(mockContext, 'test-file-key', { nodeIds: ['4:4'], format: 'PDF' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('format=PDF'),
      expect.any(Object)
    );
  });

  it('スケールを指定できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {
        '5:5': 'https://s3.amazonaws.com/figma/image@3x.png',
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await ImageExport.fetch(mockContext, 'test-file-key', { nodeIds: ['5:5'], scale: 3 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('scale=3'),
      expect.any(Object)
    );
  });

  it('APIエラーの場合は例外を投げる', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response);

    await expect(
      ImageExport.fetch(mockContext, 'test-file-key', { nodeIds: ['invalid'] })
    ).rejects.toThrow('Failed to fetch images: 400 Bad Request');
  });

  it('空のレスポンスでも正常に処理できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {},
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await ImageExport.fetch(mockContext, 'test-file-key', { nodeIds: ['invalid'] });

    expect(result.urls).toEqual({});
    expect(result.nodeIds).toEqual(['invalid']);
  });
});
