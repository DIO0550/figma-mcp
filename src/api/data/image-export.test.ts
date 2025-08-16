import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageExport, type ImageFormat } from './image-export.js';
import { FigmaContext } from '../context.js';

// fetch のモック
global.fetch = vi.fn();

describe('ImageExport', () => {
  const mockContext = FigmaContext.from('test-token');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fromOptions', () => {
    it('should create ImageExport with default values', () => {
      const exp = ImageExport.fromOptions('node-1');

      expect(exp).toEqual({
        nodeId: 'node-1',
        format: 'PNG',
        scale: 1,
      });
    });

    it('should create ImageExport with custom options', () => {
      const exp = ImageExport.fromOptions('node-1', {
        format: 'SVG',
        scale: 2,
      });

      expect(exp).toEqual({
        nodeId: 'node-1',
        format: 'SVG',
        scale: 2,
      });
    });
  });

  describe('fromNodeIds', () => {
    it('should create multiple ImageExports', () => {
      const exports = ImageExport.fromNodeIds(['node-1', 'node-2', 'node-3'], {
        format: 'JPG',
        scale: 1.5,
      });

      expect(exports).toHaveLength(3);
      expect(exports[0]).toEqual({
        nodeId: 'node-1',
        format: 'JPG',
        scale: 1.5,
      });
      expect(exports[1]).toEqual({
        nodeId: 'node-2',
        format: 'JPG',
        scale: 1.5,
      });
      expect(exports[2]).toEqual({
        nodeId: 'node-3',
        format: 'JPG',
        scale: 1.5,
      });
    });
  });

  describe('fetch', () => {
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

      const exports = [
        ImageExport.fromOptions('node-1'),
        ImageExport.fromOptions('node-2'),
      ];

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

      await expect(
        ImageExport.fetch(mockContext, 'file-1', exports)
      ).rejects.toThrow('Failed to export images: 404 Not Found');
    });
  });

  describe('fetchMultipleFormats', () => {
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

  describe('fetchMultipleScales', () => {
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

  describe('extractUrls', () => {
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

  describe('toUrlMap', () => {
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

  describe('validate', () => {
    it('should validate valid export', () => {
      const exp: ImageExport = {
        nodeId: 'node-1',
        format: 'PNG',
        scale: 2,
      };

      const errors = ImageExport.validate(exp);
      expect(errors).toEqual([]);
    });

    it('should detect missing node ID', () => {
      const exp: ImageExport = {
        nodeId: '',
        format: 'PNG',
        scale: 1,
      };

      const errors = ImageExport.validate(exp);
      expect(errors).toContain('Node ID is required');
    });

    it('should detect invalid format', () => {
      const exp: ImageExport = {
        nodeId: 'node-1',
        format: 'INVALID' as ImageFormat,
        scale: 1,
      };

      const errors = ImageExport.validate(exp);
      expect(errors[0]).toContain('Invalid format: INVALID');
    });

    it('should detect invalid scale', () => {
      const exp1: ImageExport = {
        nodeId: 'node-1',
        format: 'PNG',
        scale: 0,
      };

      const exp2: ImageExport = {
        nodeId: 'node-1',
        format: 'PNG',
        scale: 5,
      };

      const errors1 = ImageExport.validate(exp1);
      const errors2 = ImageExport.validate(exp2);

      expect(errors1[0]).toContain('Invalid scale: 0');
      expect(errors2[0]).toContain('Invalid scale: 5');
    });
  });

  describe('fetchInBatches', () => {
    it('should fetch in batches', async () => {
      const mockResponse = {
        images: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`node-${i}`, `https://example.com/${i}.png`])
        ),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const exports = Array.from({ length: 150 }, (_, i) => 
        ImageExport.fromOptions(`node-${i}`)
      );

      const results = await ImageExport.fetchInBatches(
        mockContext,
        'file-1',
        exports,
        50
      );

      expect(fetch).toHaveBeenCalledTimes(3); // 150 / 50 = 3
      expect(results).toHaveLength(150);
    });
  });

  describe('createRetinaExports', () => {
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
});