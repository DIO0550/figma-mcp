import { describe, expect, it } from 'vitest';
import type { ImageExport } from '../image.js';

describe('ImageExport インターフェース', () => {
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