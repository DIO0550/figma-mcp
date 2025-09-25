import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FileData } from '../file.js';
import type { FigmaContext } from '../../../context/index.js';

describe('FileData.fetchNodes', () => {
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

  it('指定されたノードIDの詳細情報を取得できる', async () => {
    const mockResponse = {
      name: 'File',
      nodes: {
        '1:1': {
          document: {
            id: '1:1',
            name: 'Component Node',
            type: 'COMPONENT',
            children: [],
          },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1']);

    expect(result.nodes['1:1']).toBeDefined();
    expect(result.nodes['1:1'].document.name).toBe('Component Node');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1',
      expect.objectContaining({
        method: 'GET',
        headers: mockContext.headers,
      })
    );
  });

  it('複数のノードIDを指定できる', async () => {
    const mockResponse = {
      name: 'File',
      nodes: {
        '1:1': {
          document: { id: '1:1', name: 'Node 1', type: 'FRAME', children: [] },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
        '2:2': {
          document: { id: '2:2', name: 'Node 2', type: 'FRAME', children: [] },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1', '2:2']);

    expect(Object.keys(result.nodes)).toHaveLength(2);
    expect(result.nodes['1:1'].document.name).toBe('Node 1');
    expect(result.nodes['2:2'].document.name).toBe('Node 2');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1%2C2%3A2',
      expect.any(Object)
    );
  });

  it('depthオプションを指定できる', async () => {
    const mockResponse = {
      name: 'File',
      nodes: {},
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1'], { depth: 2 });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1&depth=2',
      expect.any(Object)
    );
  });

  it('geometryオプションを指定できる', async () => {
    const mockResponse = {
      name: 'File',
      nodes: {},
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await FileData.fetchNodes(mockContext, 'test-file-key', ['1:1'], { geometry: 'paths' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/test-file-key/nodes?ids=1%3A1&geometry=paths',
      expect.any(Object)
    );
  });
});
