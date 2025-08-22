import { describe, it, expect } from 'vitest';
import { ImageExport } from '../image-export.js';

describe('ImageExport.fromOptions', () => {
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

describe('ImageExport.fromNodeIds', () => {
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