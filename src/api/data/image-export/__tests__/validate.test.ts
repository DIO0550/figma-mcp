import { describe, it, expect } from 'vitest';
import { ImageExport, type ImageFormat } from '../image-export.js';

describe('ImageExport.validate', () => {
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