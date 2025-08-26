import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImageExport } from '../image.js';
import type { FigmaContext } from '../../../context.js';
import type { ImageApiResponse } from '../../../../types/api/responses/image-responses.js';

describe('ImageExport.fetchBatch', () => {
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

  it('複数のバッチを並列で取得できる', async () => {
    const mockResponse1: ImageApiResponse = {
      images: {
        '1:1': 'https://s3.amazonaws.com/figma/batch1.png',
      },
    };

    const mockResponse2: ImageApiResponse = {
      images: {
        '2:2': 'https://s3.amazonaws.com/figma/batch2.png',
      },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse1),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse2),
      } as Response);

    const results = await ImageExport.fetchBatch(mockContext, 'test-file-key', [
      { nodeIds: ['1:1'], format: 'PNG' },
      { nodeIds: ['2:2'], format: 'JPG' },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].urls['1:1']).toBe('https://s3.amazonaws.com/figma/batch1.png');
    expect(results[0].format).toBe('PNG');
    expect(results[1].urls['2:2']).toBe('https://s3.amazonaws.com/figma/batch2.png');
    expect(results[1].format).toBe('JPG');

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('空の配列を処理できる', async () => {
    const results = await ImageExport.fetchBatch(mockContext, 'test-file-key', []);

    expect(results).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('単一のオプションも処理できる', async () => {
    const mockResponse: ImageApiResponse = {
      images: {
        '3:3': 'https://s3.amazonaws.com/figma/single.png',
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const results = await ImageExport.fetchBatch(mockContext, 'test-file-key', [
      { nodeIds: ['3:3'], format: 'PNG' },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].urls['3:3']).toBe('https://s3.amazonaws.com/figma/single.png');
  });
});
