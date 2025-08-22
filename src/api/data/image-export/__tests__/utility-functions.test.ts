import { describe, it, expect, vi } from 'vitest';
import { ImageExport } from '../image-export.js';
import { FigmaContext } from '../../../context.js';

global.fetch = vi.fn();

describe('ImageExport.fetchMultipleFormats', () => {
  const mockContext = FigmaContext.from('test-token');

  it('should fetch multiple formats for a single node', async () => {
    const mockResponse = {
      images: {
        'node-1': 'https://example.com/image.png',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const results = await ImageExport.fetchMultipleFormats(
      mockContext,
      'file-1',
      'node-1',
      ['PNG', 'SVG', 'PDF']
    );

    expect(results).toHaveLength(3);
    expect(results[0].format).toBe('PNG');
    expect(results[1].format).toBe('SVG');
    expect(results[2].format).toBe('PDF');
  });
});

describe('ImageExport.fetchMultipleScales', () => {
  const mockContext = FigmaContext.from('test-token');

  it('should fetch multiple scales for a single node', async () => {
    const mockResponse = {
      images: {
        'node-1': 'https://example.com/image.png',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const results = await ImageExport.fetchMultipleScales(
      mockContext,
      'file-1',
      'node-1',
      [1, 2, 3],
      'PNG'
    );

    expect(results).toHaveLength(3);
    expect(results[0].scale).toBe(1);
    expect(results[1].scale).toBe(2);
    expect(results[2].scale).toBe(3);
  });
});

describe('ImageExport.extractUrls', () => {
  it('should extract URLs from exports', () => {
    const exports: ImageExport[] = [
      { nodeId: 'node-1', format: 'PNG', scale: 1, url: 'https://example.com/1.png' },
      { nodeId: 'node-2', format: 'PNG', scale: 1, url: 'https://example.com/2.png' },
      { nodeId: 'node-3', format: 'PNG', scale: 1 }, // No URL
    ];

    const urls = ImageExport.extractUrls(exports);

    expect(urls).toEqual([
      'https://example.com/1.png',
      'https://example.com/2.png',
    ]);
  });
});

describe('ImageExport.toUrlMap', () => {
  it('should create URL map from exports', () => {
    const exports: ImageExport[] = [
      { nodeId: 'node-1', format: 'PNG', scale: 1, url: 'https://example.com/1.png' },
      { nodeId: 'node-2', format: 'PNG', scale: 1, url: 'https://example.com/2.png' },
      { nodeId: 'node-3', format: 'PNG', scale: 1 }, // No URL
    ];

    const map = ImageExport.toUrlMap(exports);

    expect(map).toEqual({
      'node-1': 'https://example.com/1.png',
      'node-2': 'https://example.com/2.png',
    });
  });
});

describe('ImageExport.createRetinaExports', () => {
  it('should create retina display exports', () => {
    const exports = ImageExport.createRetinaExports('node-1', 'PNG');

    expect(exports).toHaveLength(3);
    expect(exports[0]).toEqual({
      nodeId: 'node-1',
      format: 'PNG',
      scale: 1,
    });
    expect(exports[1]).toEqual({
      nodeId: 'node-1',
      format: 'PNG',
      scale: 2,
    });
    expect(exports[2]).toEqual({
      nodeId: 'node-1',
      format: 'PNG',
      scale: 3,
    });
  });

  it('should use default format', () => {
    const exports = ImageExport.createRetinaExports('node-1');
    expect(exports[0].format).toBe('PNG');
  });
});