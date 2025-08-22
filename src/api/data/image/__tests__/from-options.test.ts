import { describe, expect, it } from 'vitest';
import { ImageExport } from '../image.js';

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