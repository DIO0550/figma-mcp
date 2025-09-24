import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageExport } from '../image-export.js';
import { FigmaContext } from '../../../context/index.js';

global.fetch = vi.fn();

describe('ImageExport.fetch', () => {
  const mockContext = FigmaContext.from('test-token');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch image exports from API', async () => {
    const mockResponse = {
      images: {
        'node-1': 'https://example.com/image1.png',
        'node-2': 'https://example.com/image2.png',
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const exports = [ImageExport.fromOptions('node-1'), ImageExport.fromOptions('node-2')];

    const results = await ImageExport.fetch(mockContext, 'file-1', exports);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.figma.com/v1/images/file-1'),
      {
        method: 'GET',
        headers: {
          'X-Figma-Token': 'test-token',
        },
      }
    );

    expect(results).toHaveLength(2);
    expect(results[0].url).toBe('https://example.com/image1.png');
    expect(results[1].url).toBe('https://example.com/image2.png');
  });

  it('should handle empty exports array', async () => {
    const results = await ImageExport.fetch(mockContext, 'file-1', []);
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should group exports by format and scale', async () => {
    const mockResponse1 = {
      images: {
        'node-1': 'https://example.com/image1.png',
        'node-2': 'https://example.com/image2.png',
      },
    };

    const mockResponse2 = {
      images: {
        'node-3': 'https://example.com/image3.svg',
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse1),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse2),
      } as unknown as Response);

    const exports = [
      ImageExport.fromOptions('node-1', { format: 'PNG', scale: 1 }),
      ImageExport.fromOptions('node-2', { format: 'PNG', scale: 1 }),
      ImageExport.fromOptions('node-3', { format: 'SVG', scale: 1 }),
    ];

    const results = await ImageExport.fetch(mockContext, 'file-1', exports);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(3);
  });

  it('should throw error on failed request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const exports = [ImageExport.fromOptions('node-1')];

    await expect(ImageExport.fetch(mockContext, 'file-1', exports)).rejects.toThrow(
      'Failed to export images: 404 Not Found'
    );
  });
});
