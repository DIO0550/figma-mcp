import { describe, it, expect, vi } from 'vitest';
import { ImageExport } from '../image-export.js';
import { FigmaContext } from '../../../context/index.js';

global.fetch = vi.fn();

describe('ImageExport.fetchInBatches', () => {
  const mockContext = FigmaContext.from('test-token');

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

    const exports = Array.from({ length: 150 }, (_, i) => ImageExport.fromOptions(`node-${i}`));

    const results = await ImageExport.fetchInBatches(mockContext, 'file-1', exports, 50);

    expect(fetch).toHaveBeenCalledTimes(3); // 150 / 50 = 3
    expect(results).toHaveLength(150);
  });
});
