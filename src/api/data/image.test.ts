import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImageExport } from './image.js';
import type { FigmaContext } from '../context.js';
import type { ExportImageResponse } from '../../types/api/responses/image-responses.js';

describe('ImageExport', () => {
  const mockContext: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  describe('インターフェース', () => {
    it('必要なプロパティを持つ', () => {
      const imageExport: ImageExport = {
        nodeIds: ['1:1', '2:2'],
        format: 'PNG',
        scale: 2,
        urls: {
          '1:1': 'https://example.com/image1.png',
          '2:2': 'https://example.com/image2.png',
        },
      };

      expect(imageExport.nodeIds).toEqual(['1:1', '2:2']);
      expect(imageExport.format).toBe('PNG');
      expect(imageExport.scale).toBe(2);
      expect(imageExport.urls['1:1']).toBe('https://example.com/image1.png');
    });
  });

  describe('ImageExport.fromOptions', () => {
    it('オプションからImageExportを作成できる', () => {
      const imageExport = ImageExport.fromOptions({
        nodeIds: ['3:3'],
        format: 'SVG',
        scale: 1,
      });

      expect(imageExport.nodeIds).toEqual(['3:3']);
      expect(imageExport.format).toBe('SVG');
      expect(imageExport.scale).toBe(1);
      expect(imageExport.urls).toEqual({});
    });

    it('デフォルト値を使用できる', () => {
      const imageExport = ImageExport.fromOptions({
        nodeIds: ['4:4'],
      });

      expect(imageExport.nodeIds).toEqual(['4:4']);
      expect(imageExport.format).toBe('PNG');
      expect(imageExport.scale).toBe(1);
    });

    it('複数のノードIDを指定できる', () => {
      const imageExport = ImageExport.fromOptions({
        nodeIds: ['5:5', '6:6', '7:7'],
        format: 'JPG',
      });

      expect(imageExport.nodeIds).toHaveLength(3);
      expect(imageExport.format).toBe('JPG');
    });
  });

  describe('ImageExport.fetch', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('画像エクスポートURLを取得できる', async () => {
      const mockResponse: ExportImageResponse = {
        images: {
          '1:1': 'https://s3.amazonaws.com/figma/image1.png',
          '2:2': 'https://s3.amazonaws.com/figma/image2.png',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const imageExport = await ImageExport.fetch(
        mockContext,
        'test-file-key',
        { nodeIds: ['1:1', '2:2'], format: 'PNG', scale: 2 }
      );

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
      const mockResponse: ExportImageResponse = {
        images: {
          '3:3': 'https://s3.amazonaws.com/figma/image.svg',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await ImageExport.fetch(
        mockContext,
        'test-file-key',
        { nodeIds: ['3:3'], format: 'SVG' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=SVG'),
        expect.any(Object)
      );
    });

    it('PDFフォーマットを指定できる', async () => {
      const mockResponse: ExportImageResponse = {
        images: {
          '4:4': 'https://s3.amazonaws.com/figma/document.pdf',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await ImageExport.fetch(
        mockContext,
        'test-file-key',
        { nodeIds: ['4:4'], format: 'PDF' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=PDF'),
        expect.any(Object)
      );
    });

    it('スケールを指定できる', async () => {
      const mockResponse: ExportImageResponse = {
        images: {
          '5:5': 'https://s3.amazonaws.com/figma/image@3x.png',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await ImageExport.fetch(
        mockContext,
        'test-file-key',
        { nodeIds: ['5:5'], scale: 3 }
      );

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
      const mockResponse: ExportImageResponse = {
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

  describe('ImageExport.fetchBatch', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('複数のバッチを並列で取得できる', async () => {
      const mockResponse1: ExportImageResponse = {
        images: {
          '1:1': 'https://s3.amazonaws.com/figma/batch1.png',
        },
      };

      const mockResponse2: ExportImageResponse = {
        images: {
          '2:2': 'https://s3.amazonaws.com/figma/batch2.png',
        },
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse1),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse2),
        } as Response);

      const results = await ImageExport.fetchBatch(
        mockContext,
        'test-file-key',
        [
          { nodeIds: ['1:1'], format: 'PNG' },
          { nodeIds: ['2:2'], format: 'JPG' },
        ]
      );

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
      const mockResponse: ExportImageResponse = {
        images: {
          '3:3': 'https://s3.amazonaws.com/figma/single.png',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const results = await ImageExport.fetchBatch(
        mockContext,
        'test-file-key',
        [{ nodeIds: ['3:3'], format: 'PNG' }]
      );

      expect(results).toHaveLength(1);
      expect(results[0].urls['3:3']).toBe('https://s3.amazonaws.com/figma/single.png');
    });
  });
});